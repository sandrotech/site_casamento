## Objetivo
- Voltar o `main` para o estado exato do commit `43b57a578633f60a088827a682dd6553ac00fa29`.
- Garantir que o remoto (`origin/main`) reflita esse estado e que o Coolify faça o redeploy desse conteúdo.

## Opções de Rollback
- Opção A (reset duro): sobrescreve o histórico local e remoto para aquele commit.
- Opção B (revert): cria um novo commit que desfaz o(s) commit(s) posteriores, preservando o histórico.

## Passos Recomendados (Reset duro)
- Verificar se o diretório está limpo:
  - `git status`
- Buscar o remoto, para garantir referência atual:
  - `git fetch origin`
- Resetar para o commit desejado:
  - `git reset --hard 43b57a578633f60a088827a682dd6553ac00fa29`
- Empurrar para o remoto com proteção:
  - `git push --force-with-lease origin main`
- Opcional: se houver arquivos não rastreados que atrapalhem futuros builds, limpar:
  - `git clean -fd`

## Alternativa (Revert preservando histórico)
- Identificar os commits após `43b57a5` com:
  - `git log --oneline -n 5`
- Reverter o(s) commit(s) que vieram depois (por exemplo, o último `2644551`):
  - `git revert <hash_do_commit_a_reverter>`
- Empurrar normalmente:
  - `git push origin main`

## Considerações
- Reset duro altera o histórico; usar `--force-with-lease` minimiza risco de sobrescrever trabalhos remotos.
- Após o push, o Coolify deve disparar um redeploy com o estado do commit alvo.

## Verificação
- Conferir no repositório remoto que `main` aponta para `43b57a5`.
- Acompanhar logs do Coolify e validar que o build/execução sobem sem os erros anteriores.
