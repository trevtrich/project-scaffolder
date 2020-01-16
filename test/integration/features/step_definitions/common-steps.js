import stubbedFs from 'mock-fs';
import {promises} from 'fs';
import {resolve} from 'path';
import {Before, After, When, setWorldConstructor} from 'cucumber';
import any from '@travi/any';
import {World} from '../support/world';
import {scaffold, questionNames} from '../../../../src';

setWorldConstructor(World);

Before(async () => {
  const projectTemplatePath = '../../../../templates';

  stubbedFs({
    templates: {
      'README.mustache': await promises.readFile(resolve(__dirname, projectTemplatePath, './README.mustache')),
      'editorconfig.txt': await promises.readFile(resolve(__dirname, projectTemplatePath, './editorconfig.txt'))
    }
  });
});

After(() => stubbedFs.restore());

When(/^the project is scaffolded$/, async function () {
  const repoShouldBeCreated = this.getAnswerFor(questionNames.GIT_REPO);
  const visibility = any.fromList(['Public', 'Private']);

  await scaffold({
    languages: {},
    overrides: {},
    decisions: {
      [questionNames.PROJECT_NAME]: 'project-name',
      [questionNames.DESCRIPTION]: 'some project description',
      [questionNames.VISIBILITY]: visibility,
      ...'Public' === visibility && {
        [questionNames.LICENSE]: 'MIT',
        [questionNames.COPYRIGHT_HOLDER]: any.word(),
        [questionNames.COPYRIGHT_YEAR]: 2000
      },
      ...'Private' === visibility && {[questionNames.UNLICENSED]: true},
      [questionNames.GIT_REPO]: repoShouldBeCreated,
      ...repoShouldBeCreated && {[questionNames.REPO_HOST]: 'Other'},
      [questionNames.PROJECT_TYPE]: 'Other'
    }
  });
});
