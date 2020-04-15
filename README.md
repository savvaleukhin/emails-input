# (strange) Emails Input component

[Live demo](https://sleukhin.github.io/emails-input)

Multiple entry email chips input. Zero dependency. Email validation.
Delivered as two separate files:

- main.js
- main.css

### Usage

Download component `dist` folder
Copy files to your project public folder.

In HTML:

```javascript
<link href="public/emails-input/main.css" rel="stylesheet" />
...
<div id="emails-input"></div>
...
<script src="public/emails-input/main.js"></script>
```

In JS:

```javascript
var inputContainerNode = document.querySelector("#emails-input");
var emailsInput = EmailsInput(inputContainerNode);
```

### API

| Property  | Description                 | Input           | Output |
| --------- | --------------------------- | --------------- | ------ |
| get       | returns options             | -               | Array  |
| add       | adds an options             | Array \| String | -      |
| replace   | replaces all options        | Array \| String | -      |
| subscribe | subscribe to options update | Function        | -      |
