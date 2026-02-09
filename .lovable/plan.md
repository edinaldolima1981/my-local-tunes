

# Remover o Sistema de Trial/Licenca do App

## O que sera feito

Remover completamente todo o sistema de trial, licenca e pagamento do app. Depois dessa mudanca, o app vai abrir direto sem nenhum bloqueio ou banner de trial.

## Mudancas

### 1. `src/App.tsx`
- Remover o import do `LicenseProvider` e `useLicense`
- Remover o import do `PaymentScreen`
- Remover o componente `LicenseGate` (que ja esta desativado mas ainda existe no codigo)
- Remover o `LicenseProvider` do `MainApp`
- O `Index` vai ser renderizado diretamente sem o wrapper `LicenseGate`

### 2. `src/pages/Index.tsx`
- Remover o import do `TrialBanner`
- Remover o componente `TrialBanner` da tela principal

### 3. `src/hooks/useAuth.tsx`
- Remover o import do `getDeviceId` do `licenseService`
- Remover a funcao `linkLicenseToUser` que vincula licenca ao usuario no login
- Remover a chamada a `linkLicenseToUser` no evento `SIGNED_IN`

### Arquivos que serao mantidos (nao deletados)
Os seguintes arquivos continuam existindo mas nao serao mais usados pelo fluxo principal. Eles podem ser removidos depois se voce quiser:
- `src/services/licenseService.ts`
- `src/hooks/useLicense.tsx`
- `src/components/license/PaymentScreen.tsx`
- `src/components/license/TrialBanner.tsx`
- `src/components/admin/LicenseManager.tsx` (usado na rota /admin)

## Resultado
- App abre direto apos o login, sem nenhum bloqueio
- Sem banner de trial na tela
- Sem verificacao de licenca em nenhum momento

