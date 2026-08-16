-- =============================================================================
-- Campeonato FIFA · Unidos Acamp — placar ao vivo
--
-- Como a chave anônima fica visível para quem abrir o site, o desenho parte do
-- princípio de que ela é pública:
--
--   * `campeonatos` é lida por qualquer um, mas ninguém escreve nela direto.
--   * Toda gravação passa pela função `salvar_campeonato`, que exige o PIN.
--   * O hash do PIN mora em `segredos`, uma tabela sem nenhuma permissão para
--     as chaves públicas — e fora da publicação de tempo real, para não vazar
--     no payload de nenhum evento.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tabelas ---

create table if not exists public.campeonatos (
  id            text primary key,
  estado        jsonb       not null default '{}'::jsonb,
  versao        bigint      not null default 1,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.segredos (
  id       text primary key references public.campeonatos (id) on delete cascade,
  pin_hash text not null
);

-- ------------------------------------------------------------------- RLS ---

alter table public.campeonatos enable row level security;
alter table public.segredos    enable row level security;

-- Leitura liberada: é o placar público. Sem política de escrita, ninguém
-- escreve direto — nem com a chave anônima, nem depois de logar.
drop policy if exists "placar e publico" on public.campeonatos;
create policy "placar e publico" on public.campeonatos for select using (true);

-- `segredos` fica sem nenhuma política: só funções SECURITY DEFINER a enxergam.

revoke all on public.campeonatos from anon, authenticated;
revoke all on public.segredos    from anon, authenticated;
grant select on public.campeonatos to anon, authenticated;

-- -------------------------------------------------------------- funções ---

-- Confere o PIN sem gravar nada. Usada para destravar o Painel Admin.
create or replace function public.conferir_pin(p_id text, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select pin_hash into v_hash from public.segredos where id = p_id;
  if v_hash is null then
    return false;
  end if;

  if extensions.crypt(p_pin, v_hash) = v_hash then
    return true;
  end if;

  -- Atraso proposital: encarece a tentativa de adivinhar o PIN na força bruta.
  perform pg_sleep(0.4);
  return false;
end;
$$;

-- Gravação do campeonato. Só avança se o PIN bater.
create or replace function public.salvar_campeonato(p_id text, p_estado jsonb, p_pin text)
returns table (versao bigint, atualizado_em timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select pin_hash into v_hash from public.segredos where id = p_id;
  if v_hash is null then
    raise exception 'campeonato % nao existe', p_id using errcode = 'P0002';
  end if;

  if extensions.crypt(p_pin, v_hash) <> v_hash then
    perform pg_sleep(0.4);
    raise exception 'PIN incorreto' using errcode = '28000';
  end if;

  return query
    update public.campeonatos c
       set estado = p_estado,
           versao = c.versao + 1,
           atualizado_em = now()
     where c.id = p_id
    returning c.versao, c.atualizado_em;
end;
$$;

-- Troca o PIN, exigindo o atual.
create or replace function public.trocar_pin(p_id text, p_pin_atual text, p_pin_novo text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select pin_hash into v_hash from public.segredos where id = p_id;
  if v_hash is null or extensions.crypt(p_pin_atual, v_hash) <> v_hash then
    perform pg_sleep(0.4);
    return false;
  end if;

  if length(coalesce(p_pin_novo, '')) < 6 then
    raise exception 'o PIN novo precisa de pelo menos 6 caracteres' using errcode = '22023';
  end if;

  update public.segredos
     set pin_hash = extensions.crypt(p_pin_novo, extensions.gen_salt('bf', 10))
   where id = p_id;

  return true;
end;
$$;

-- Inscrição pública (o QR code do acampamento).
--
-- É a única gravação que dispensa o PIN, então tem trava própria: só funciona
-- antes do sorteio, limita o total de inscritos, exige nome utilizável e
-- recusa nome repetido. Nada além de acrescentar um participante.
-- `p_time_novo` chega preenchido quando a pessoa cadastra um time que não está
-- na lista: {nome, cores:[hex,hex], escudo?}. O time nasce junto da inscrição.
create or replace function public.inscrever(
  p_id text,
  p_nome text,
  p_time text default null,
  p_time_novo jsonb default null
)
returns table (posicao int, total int, time_id text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_estado      jsonb;
  v_nome        text := btrim(coalesce(p_nome, ''));
  v_time        text := nullif(btrim(coalesce(p_time, '')), '');
  v_inscritos   jsonb;
  v_times       jsonb;
  v_total       int;
  v_nome_time   text;
  v_cores       jsonb;
  v_escudo      text;
  v_cor         text;
begin
  if length(v_nome) < 2 or length(v_nome) > 40 then
    raise exception 'nome precisa ter de 2 a 40 caracteres' using errcode = '22023';
  end if;

  select estado into v_estado from public.campeonatos where id = p_id for update;
  if v_estado is null then
    raise exception 'campeonato % nao existe', p_id using errcode = 'P0002';
  end if;

  if jsonb_array_length(coalesce(v_estado->'seeds', '[]'::jsonb)) > 0 then
    raise exception 'as chaves ja foram sorteadas' using errcode = '22023';
  end if;

  v_inscritos := coalesce(v_estado->'participantes', '[]'::jsonb);
  v_times     := coalesce(v_estado->'timesDoUsuario', '[]'::jsonb);
  v_total     := jsonb_array_length(v_inscritos);

  if v_total >= 64 then
    raise exception 'o campeonato ja esta lotado' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(v_inscritos) as inscrito
     where lower(btrim(inscrito->>'nome')) = lower(v_nome)
  ) then
    raise exception 'ja existe alguem inscrito com esse nome' using errcode = '23505';
  end if;

  ---------------------------------------------------------------- time novo --
  if p_time_novo is not null and p_time_novo <> 'null'::jsonb then
    v_nome_time := btrim(coalesce(p_time_novo->>'nome', ''));
    if length(v_nome_time) < 2 or length(v_nome_time) > 40 then
      raise exception 'o nome do time precisa ter de 2 a 40 caracteres' using errcode = '22023';
    end if;

    if jsonb_array_length(v_times) >= 40 then
      raise exception 'ja ha times personalizados demais' using errcode = '22023';
    end if;

    if exists (
      select 1 from jsonb_array_elements(v_times) as time_existente
       where lower(btrim(time_existente->>'nome')) = lower(v_nome_time)
    ) then
      raise exception 'ja existe um time com esse nome' using errcode = '23505';
    end if;

    v_cores := p_time_novo->'cores';
    if jsonb_typeof(v_cores) <> 'array' or jsonb_array_length(v_cores) <> 2 then
      raise exception 'o time precisa de duas cores' using errcode = '22023';
    end if;
    for v_cor in select jsonb_array_elements_text(v_cores) loop
      if v_cor !~ '^#[0-9a-fA-F]{6}$' then
        raise exception 'cor invalida' using errcode = '22023';
      end if;
    end loop;

    -- Escudo é opcional; quando vem, só imagem e com tamanho contido.
    v_escudo := p_time_novo->>'escudo';
    if v_escudo is not null then
      if v_escudo !~ '^data:image/(png|jpeg|webp);base64,' or length(v_escudo) > 120000 then
        raise exception 'escudo invalido' using errcode = '22023';
      end if;
    end if;

    v_time := 'novo-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    v_times := v_times || jsonb_strip_nulls(jsonb_build_object(
      'id', v_time,
      'nome', v_nome_time,
      'liga', 'Meus times',
      'cores', v_cores,
      'escudo', v_escudo
    ));
  end if;

  if v_time is null then
    raise exception 'escolha um time' using errcode = '22023';
  end if;

  ------------------------------------------------------- um time por pessoa --
  if exists (
    select 1 from jsonb_array_elements(v_inscritos) as inscrito
     where inscrito->>'timeId' = v_time
  ) then
    raise exception 'esse time ja foi escolhido' using errcode = '23505';
  end if;

  update public.campeonatos
     set estado = jsonb_set(
           jsonb_set(v_estado, '{timesDoUsuario}', v_times),
           '{participantes}',
           v_inscritos || jsonb_build_object(
             'id', 'qr' || substr(md5(random()::text || clock_timestamp()::text), 1, 7),
             'nome', v_nome,
             'timeId', v_time
           )
         ),
         versao = versao + 1,
         atualizado_em = now()
   where id = p_id;

  return query select v_total + 1, v_total + 1, v_time;
end;
$$;

revoke all on function public.conferir_pin(text, text) from public;
-- A assinatura antiga sai de cena para não ficar rota pública sem as travas novas.
drop function if exists public.inscrever(text, text, text);
revoke all on function public.inscrever(text, text, text, jsonb) from public;
grant execute on function public.inscrever(text, text, text, jsonb) to anon, authenticated;
revoke all on function public.salvar_campeonato(text, jsonb, text) from public;
revoke all on function public.trocar_pin(text, text, text) from public;
grant execute on function public.conferir_pin(text, text) to anon, authenticated;
grant execute on function public.salvar_campeonato(text, jsonb, text) to anon, authenticated;
grant execute on function public.trocar_pin(text, text, text) to anon, authenticated;

-- -------------------------------------------------------- tempo real ---

-- O evento serve apenas de aviso: o cliente relê a linha pelo REST, o que evita
-- depender do tamanho do payload quando o estado cresce com escudos enviados.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'campeonatos'
  ) then
    alter publication supabase_realtime add table public.campeonatos;
  end if;
end;
$$;
