# electron-dynamic-prompt

Electron helper to prompt for dynamic fields

## Usage

```sh
yarn add electron-dynamic-prompt
```

```js
prompt([options, parentBrowserWindow]).then(...).catch(...)
```

## Example

```js
const prompt = require('electron-prompt');

prompt({
    modal: false,
    title: 'Dialog Title',
    header: 'Dialog Title',
    description: 'Dialog description',
    height: 380,
    fields: [
        {
            id: 'field1',
            label: 'Field 1',
            type: 'input',
            attrs: {
                placeholder: 'Field 1',
                required: true
            }
        },
        {
            id: 'field2',
            label: 'Field 2',
            type: 'input',
            attrs: {
                type: 'password',
                placeholder: 'Field 1',
                required: true
            }
        }
    ],
    validator: (args) => new Promise((resolve, reject) => {
        if(args.field1 == 'abcd' && args.field2 == '1234') {
            resolve()
        } else {
            reject('Invalid username or password')
        }
    })
})
.then((r) => {
    if(r === null) {
        console.log('user cancelled');
    } else {
        console.log('result', r);
    }
})
.catch(console.error);
```

## Documentation

Primary method:

```js
prompt([options, parentBrowserWindow]).then(...).catch(...)
```

### Options object (optional)

| Key  | Explanation |
| ------------- | ------------- |
| title  | (optional, string) The title of the prompt window. Defaults to 'Dialog'. |
| header  | (optional, string) The header which appears on the prompt for the input field. Defaults to ''. |
| description  | (optional, string) The description which appears on the prompt below the header. Defaults to ''. |
| buttonLabels | (optional, object) The text for the OK/cancel buttons. Properties are 'ok' and 'cancel'. Defaults to null. |
| fields | (requred: array) The fields to display in the dialog |
| validator | (optional) Validate the response before closing the dialog |
| width  | (optional, integer) The width of the prompt window. Defaults to 370. |
| minWidth  | (optional, integer) The minimum allowed width for the prompt window. Same default value as width. |
| height  | (optional, integer) The height of the prompt window. Defaults to 130. |
| minHeight  | (optional, integer) The minimum allowed height for the prompt window. Same default value as height. |
| resizable  | (optional, boolean) Whether the prompt window can be resized or not (also sets useContentSize). Defaults to false. |
| alwaysOnTop | (optional, boolean) Whether the window should always stay on top of other windows. Defaults to false |
| icon | (optional, string) The path to an icon image to use in the title bar. Defaults to null and uses electron's icon. |
| customStylesheet  | (optional, string) The local path of a CSS file to stylize the prompt window. Defaults to null. |
| menuBarVisible | (optional, boolean) Whether to show the menubar or not. Defaults to false. |
| skipTaskbar | (optional, boolean) Whether to show the prompt window icon in taskbar. Defaults to true. |

If not supplied, it uses the defaults listed in the table above.

### parentBrowserWindow (optional)

The window in which to display the prompt on. If not supplied, the parent window of the prompt will be null.
