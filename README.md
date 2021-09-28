# Joomla Template converter

Joomla 4.1 (this is speculative) will support templates with the ability to create child template. Actually the code already exists since 4.0 and this [Pull Request](https://github.com/joomla/joomla-cms/pull/30192), so this should be fairly safe right now. The UI is missing anything meaningful right now (Joomla version <4.1) so although the new mode is supported but is lacking the UI for managing them efficiently, hopefully this [Pull Request](https://github.com/joomla/joomla-cms/pull/32896) will be done and merged into 4.1. So, why do we need this convertor in the first place? Well, the new mode templates coming with some changes.

## Breaking Changes
So the new mode templates come with some breaking changes:
- The manifest needs `<inheritable>1</inheritable>` to indicate the installer that this supports child templates
- The static assets should be placed in the `/media/templates/(site || administrator)/(template name)`. Static assets are all those files that are directly fetched from the browser (eg.: `.css`, `.js`, `.png`... Basically the folders `css,js,images`).
- The new mode should support `namespace` by default. At the time of righting this, the decision is not made yet but there's a [Pull Request](https://github.com/joomla/joomla-cms/pull/30816).

## How it works
This tool will convert any template (that's not already supporting the new mode) to the new mode. It supports:
- templates as an intallable `.zip` file
- templates in an existing folder

You will need Node and npm installed in your machine and then runing either:

`npx dgrammatiko@convert-template templateFolder`

or

`npx dgrammatiko@convert-template template.zip`


The result will be a zip file name `inheritable_templateFolder.zip`

## Gotchas
- The tool will not patch the PHP files to the correct namespace.

- The tool will not fix wrong instances of static assets inclusions. Use always the new Web Assets or at the very least the `HTMLHelper::_()`

- The tool will not fix the hardcoded instances of `$template->template`. These should be hardcoded to be non dynamic eg: instead of `'/template/' . $template->template . '/css'` should be written as `'/template/templateName/css'`
