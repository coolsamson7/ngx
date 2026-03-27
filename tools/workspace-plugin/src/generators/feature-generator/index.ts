import { formatFiles, generateFiles, getProjects, Tree } from '@nx/devkit';
import { FeatureGeneratorSchema } from './schema';
import { join } from 'path';

/**
 * main function
 * @param host the virtual file system
 * @param schema the config
 */
export default async function (tree: Tree, schema: FeatureGeneratorSchema) {
  // validate some settings

  if (schema.speechCommandMixin) schema.commandMixin = true

  // read project from workspace.json / angular.json

  const project = getProjects(tree).get(schema.projectName);
  if (!project) {
    throw new Error(`Project '${schema.projectName}' not found in workspace configuration`);
  }

  // create the files

  const capitalized = (str: string) => {
     return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const formatList = (str: string) => str.split(',').map(item => "\"" + item + "\"").join(", ")

  const mixins: (keyof FeatureGeneratorSchema)[] = [
    "dialogMixin",
    "commandMixin",
    "onLocaleChangeMixin",
    "stateMixin",
    "viewMixin",
    "routingMixin",
    "speechCommandMixin",
  ]
  const mixinExpressions = ["WithDialogs", "WithCommands", "WithOnLocaleChange", "WithState<" + capitalized(schema.name) + "Component" + ">()", "WithView", "WithRouting", "WithSpeechCommands"]

  const formatSuperclass = () => {
     let superClass = "AbstractFeature"

     // check all mixins

     let index = 0
     for (const mixin of mixins) {
        if (schema[mixin] === true) {
           superClass = mixinExpressions[index] + "(" + superClass + ")"
        }

        index++
     }

     // done

     return superClass
  }

  if (!project.sourceRoot) {
    throw new Error(`Project '${schema.projectName}' has no sourceRoot configured`);
  }

  const generatorRoot = join(process.cwd(), 'tools/workspace-plugin/src/generators/feature-generator');

  generateFiles(tree, join(generatorRoot, "templates"), join(project.sourceRoot, schema.directory || ""), {
    name: schema.name,
    schema: schema,
    feature: schema.name,
    format: {
       formatList: formatList,
       className: () => capitalized(schema.name) + "Component",
       superclass: formatSuperclass
    },
    selector: schema.name,
    style: schema.style || "scss",
    tmpl: '', // remove __tmpl__ from file endings
  });

  // format all files which were created / updated in this schematic

  await formatFiles(tree);
}
