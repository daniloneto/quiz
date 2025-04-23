# Documentação do Fluxo de Trabalho do GitFlow

## Introdução

O **GitFlow** é um modelo de ramificação que proporciona uma maneira estruturada de gerenciar o desenvolvimento de software. Ele utiliza branches específicas para diferentes tipos de trabalho, permitindo que equipes desenvolvam, testem e lancem novas funcionalidades de forma organizada.

## Estrutura de Branches

O fluxo de trabalho do GitFlow é baseado nas seguintes branches principais:

- **`main`**: Esta é a branch principal onde o código de produção está sempre estável. As versões finais são mescladas aqui.
- **`develop`**: A branch de desenvolvimento onde as novas funcionalidades são integradas antes de serem liberadas.

### Branches de Funcionalidades

- **`feature/*`**: Branches usadas para desenvolver novas funcionalidades. Cada nova funcionalidade deve ter sua própria branch, que é criada a partir da branch `develop`.

### Branches de Releases

- **`release/*`**: Branches usadas para preparar uma nova versão. Quando a funcionalidade está completa, e a equipe está pronta para lançar uma nova versão, uma branch de release é criada a partir da branch `develop`.

### Branches de Correções

- **`hotfix/*`**: Branches usadas para corrigir bugs em produção. Essas branches são criadas a partir da branch `main` e são mescladas de volta na `main` e na `develop` após a correção ser concluída.

### Branches de Suporte

- **`support/*`**: (Opcional) Branches que podem ser criadas para dar suporte a versões anteriores do software.

## Comandos do GitFlow

### Inicialização do GitFlow

Para iniciar o GitFlow em um repositório existente, execute o seguinte comando:

```bash
git flow init
```

Isso criará as branches padrão e configurará o repositório para o uso do GitFlow.

### Criar uma Nova Funcionalidade

Para criar uma nova branch de funcionalidade, use o comando:

```bash
git flow feature start <nome-da-funcionalidade>
```

### Finalizar uma Funcionalidade

Depois de concluir o desenvolvimento de uma funcionalidade, finalize-a com:

```bash
git flow feature finish <nome-da-funcionalidade>
```

Isso mesclará a branch de funcionalidade de volta à branch `develop` e a removerá.

### Criar uma Release

Para iniciar o processo de lançamento de uma nova versão, use:

```bash
git flow release start <número-da-versão>
```

Após a criação da release e realização dos testes, finalize a release com:

```bash
git flow release finish <número-da-versão>
```

Isso mesclará as alterações na branch `main`, criará uma tag para a nova versão e mesclará as mudanças de volta na branch `develop`.

### Corrigir um Bug em Produção

Se um bug precisar ser corrigido rapidamente, crie uma branch de hotfix:

```bash
git flow hotfix start <número-da-versão-corrigida>
```

Finalize a correção com:

```bash
git flow hotfix finish <número-da-versão-corrigida>
```

Isso mesclará as alterações na branch `main` e na branch `develop`.


## Conclusão

O uso do GitFlow permite que a equipe trabalhe de forma organizada e eficiente. Siga este fluxo de trabalho para garantir que o desenvolvimento de novas funcionalidades, correções e releases seja gerido de maneira eficaz.

Para mais informações sobre o GitFlow, consulte a [documentação oficial do GitFlow](https://nvie.com/posts/a-successful-git-branching-model/).

---
