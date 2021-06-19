import path from 'path';

function getFileName(filenamePath: string): string | undefined {
    const parentPath = path.dirname(filenamePath).split(path.sep).pop()
    const fileName = filenamePath.split(path.sep).pop();
    return parentPath + path.sep + fileName;
}

export { getFileName };