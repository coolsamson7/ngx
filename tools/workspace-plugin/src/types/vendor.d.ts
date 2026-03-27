declare module 'find-in-files' {
  export function find(
    text: string,
    folder: string,
    fileFilter?: string
  ): Promise<Record<string, unknown>>;
}

declare module 'find-nearest-package-json' {
  export function findNearestPackageJsonSync(dir: string): {
    data: any;
    path: string;
  };
}

