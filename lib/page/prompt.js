const fs = require('fs');
const {ipcRenderer } = require('electron');
const docReady = require('doc-ready');

let promptId = null;
let promptOptions = null;

const promptError = (error) => {
	if (error instanceof Error) {
		error = error.message;
	}
	ipcRenderer.sendSync('prompt-error:' + promptId, error);
}

const promptCancel = () => {
	ipcRenderer.sendSync('prompt-post-data:' + promptId, null);
}

const promptSubmit = (e) => {
	e.preventDefault()
	const fields = Array.from(document.querySelectorAll('.form-control'))
	const dataSet = fields.map(i => ({ id: i.id, value: i.value })).reduce((acc, curr) => {
		var out = acc
		out[curr.id] = curr.value
		return out
	}, {})
	ipcRenderer.once('prompt-post-data-reply:' + promptId, (event, arg) => {
		try {
			let error = document.getElementById('error')
			error.innerText = arg
			error.classList.add('show')
			clearFields()
		} catch(_) {}
	})
	ipcRenderer.send('prompt-post-data:' + promptId, dataSet)
}

const clearFields = () => {
	const fields = Array.from(document.querySelectorAll('.form-control'))
	for(let field of fields) {
		field.value = ''
	}
}

const promptRegister = () => {
	promptId = document.location.hash.replace('#', '');

	try {
		promptOptions = JSON.parse(ipcRenderer.sendSync('prompt-get-options:' + promptId));
	} catch (error) {
		return promptError(error);
	}

	try {
		let bodyContent = document.getElementsByTagName('body')[0]
		bodyContent.classList.add(promptOptions.darkMode ? 'dark-mode' : 'light-mode')
	} catch(_) {

	}

	if (promptOptions.header !== undefined) {
		document.querySelector('#header').textContent = promptOptions.header;
	}

	if (promptOptions.description !== undefined) {
		document.querySelector('#description').textContent = promptOptions.description;
	}

	if (promptOptions.buttonLabels && promptOptions.buttonLabels.ok) {
		document.querySelector('#ok').textContent = promptOptions.buttonLabels.ok;
	}

	if (promptOptions.buttonLabels && promptOptions.buttonLabels.cancel) {
		document.querySelector('#cancel').textContent = promptOptions.buttonLabels.cancel;
	}

	try {
		if (promptOptions.customStylesheet) {
			const customStyleContent = fs.readFileSync(promptOptions.customStylesheet);
			if (customStyleContent) {
				const customStyle = document.createElement('style');
				customStyle.setAttribute('rel', 'stylesheet');
				customStyle.append(document.createTextNode(customStyleContent));
				document.head.append(customStyle);
			}
		}
	} catch (error) {
		return promptError(error);
	}

	document.getElementById('form').addEventListener('submit', promptSubmit);
	document.querySelector('#cancel').addEventListener('click', promptCancel);

	const dataContainerElement = document.querySelector('#data-container');

	const fields = promptOptions.fields || []
	for(let field of fields) {
		let elGroup = document.createElement('div')
		elGroup.classList.add('form-group')
		dataContainerElement.append(elGroup)

		let elLabel = document.createElement('label')
		elLabel.setAttribute('for', field.id)
		elLabel.innerText = field.label
		elGroup.append(elLabel)

		var elField
		switch(field.type) {
			case 'input':
				elField = document.createElement('input')
				break
		}

		for(let [id, val] of Object.entries(field.attrs)) {
			if(elField !== undefined) elField.setAttribute(id, val)
		}

		if(elField !== undefined) {
			elField.id = field.id
			elField.setAttribute('data-id', field.id)

			elField.addEventListener('keyup', event => {
				if (event.key === 'Escape') {
					promptCancel();
				}
			});
		
			elField.addEventListener('keypress', event => {
				if (event.key === 'Enter') {
					event.preventDefault();
					document.querySelector('#ok').click();
				}
			});

			elField.classList.add('form-control')
			elGroup.append(elField)
		}
	}
}

window.addEventListener('error', error => {
	if (promptId) {
		promptError('An error has occured on the prompt window: \n' + error);
	}
});

docReady(promptRegister);
