import { generateFiles, ProjectConfiguration, Tree, joinPathFragments } from '@nx/devkit';
import { join } from 'path';

export class WebpackWriter {
  constructor(private project: ProjectConfiguration, private projectName: string) {}

  async write(host: Tree, manifest: any) {
    // write router module

    //const webpackTemplatePath = 'tools/workspace-plugin/src/generators/portal-artifact-generator/webpack/templates';
    const webpackTemplatePath = join(
      process.cwd(),
      'tools/workspace-plugin/src/generators/portal-artifact-generator/webpack/templates'
    )

    const moduleName = manifest.module.component;
    const fileName = manifest.module.file;

    // generate files

    generateFiles(host, webpackTemplatePath, this.project.root, {
      manifest,
      path: (path: string) => joinPathFragments(webpackTemplatePath, path),
      projectName: this.projectName,
      moduleName: moduleName,
      moduleFile: fileName,
      tmpl: '', // remove __tmpl__ from file endings
    });
  }
}
