

# Corrigir o Loading Infinito do App

## Problema Identificado

Depois que voce faz login, o app fica rodando (carregando) sem parar. Isso acontece por causa de duas verificacoes que travam:

1. **Verificacao de admin** - tenta chamar o banco de dados para saber se voce eh admin, mas demora 5 segundos pra desistir
2. **Verificacao de licenca** - faz outra chamada ao banco que tambem pode travar

Enquanto essas duas nao terminam, o app fica no spinner de loading.

## Solucao

Simplificar essas verificacoes para que o app carregue rapido:

1. **Remover a verificacao de admin do fluxo principal** - So verificar admin quando for necessario (na rota /admin). Usuarios normais nao precisam esperar isso.

2. **Tornar o LicenseGate mais simples** - Se a licenca ainda esta carregando, mostrar o app normalmente em vez de bloquear. So bloquear quando confirmar que a licenca expirou.

3. **Adicionar timeout na verificacao de licenca** - Se demorar mais de 3 segundos, liberar o acesso e verificar em segundo plano.

## Detalhes Tecnicos

### Arquivo: `src/App.tsx`

- Simplificar o `LicenseGate`: remover a verificacao `has_role` (admin check) deste componente
- Enquanto `isLoading` for true, renderizar os `children` normalmente (em vez de mostrar loading)
- So mostrar `PaymentScreen` quando `isLoading === false` E `status.isValid === false`

### Arquivo: `src/hooks/useLicense.tsx`

- Adicionar timeout de 3 segundos no `refreshStatus` - se o banco nao responder, assumir licenca valida (modo offline)
- Evitar que o loading bloqueie a interface

### Resultado Esperado

- Splash screen aparece normalmente
- Onboarding aparece (se for primeira vez)
- Tela de login aparece
- Apos login, o app carrega **imediatamente** sem ficar rodando
- A verificacao de licenca acontece em segundo plano

