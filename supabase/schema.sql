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

revoke all on function public.conferir_pin(text, text) from public;
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
