import "./styles.css";

// closest Polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

function makeGetId() {
  var id = 0;
  return function () {
    return id++;
  };
}

function validateEmail(email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function isString(arg) {
  return typeof arg === "string";
}

function isEvent(arg) {
  return isString(arg) && arg.substr(0, 2) === "on";
}

function isDataAttr(arg) {
  return isString(arg) && arg.substr(0, 5) === "data-";
}

function createElement({ type, props = {} }) {
  var element = document.createElement(type);

  Object.keys(props).forEach(function (key) {
    if (key === "children") {
      var children = props[key];

      if (isString(children)) {
        element.textContent = children;
      } else {
        if (Array.isArray(children)) {
          children.forEach(function (child) {
            element.appendChild(child);
          });
        } else {
          element.appendChild(props[key]);
        }
      }
    } else if (isEvent(key)) {
      element.addEventListener(key.toLowerCase().substr(2), props[key]);
    } else if (isDataAttr(key)) {
      element.setAttribute(key, props[key]);
    } else {
      element.setAttribute(key, props[key]);
    }
  });

  return element;
}

function notifySubscribers(subscribers, data) {
  subscribers.forEach(function (cb) {
    cb(data);
  });
}

function render(node, container, before) {
  function insert(n) {
    if (before) {
      container.insertBefore(n, before);
    } else {
      container.appendChild(n);
    }
  }

  if (Array.isArray(node)) {
    node.forEach(function (n) {
      insert(n);
    });
  } else {
    insert(node);
  }
}

function getOptionsFromText(text, getId) {
  var options = text
    .split(",")
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item.length > 0;
    })
    .map(function (item) {
      return { id: getId(), valid: validateEmail(item), text: item };
    });
  return options;
}

function createEmailItem({ id, text, valid }, onRemove) {
  return createElement({
    type: "div",
    props: {
      "data-id": id,
      class:
        "email-input__item" +
        " " +
        "email-input__item_" +
        (valid ? "valid" : "invalid"),
      children: [
        createElement({
          type: "span",
          props: { children: text },
        }),
        createElement({
          type: "span",
          props: {
            onClick: onRemove,
            class: "email-input__remove-btn",
            children: "×",
          },
        }),
      ],
    },
  });
}

function EmailsInput(container, initialOptions) {
  var getId;
  var options;
  var subscribers = [];
  var inner;
  var input;

  function setOptions(nextOptions) {
    options = nextOptions;
    setTimeout(notifySubscribers, 0, subscribers, options);
  }

  function init(initialOptions = []) {
    getId = makeGetId();
    setOptions(
      initialOptions.map(function (text) {
        return {
          id: getId(),
          valid: validateEmail(text),
          text,
        };
      })
    );
  }

  function addOptions(textInput) {
    var newOptions = getOptionsFromText(textInput, getId);
    setOptions([...options, ...newOptions]);
    render(
      newOptions.map(function (o) {
        return createEmailItem(o, handleRemove);
      }),
      inner,
      input
    );
  }

  function removeOption(removableId, ref) {
    setOptions(
      options.filter(function (o) {
        return o.id !== removableId;
      })
    );
    removeNode(ref);
  }

  function removeNode(ref) {
    inner.removeChild(ref);
  }

  function handleRemove(event) {
    var removableRef = event.target.closest("[data-id]");
    var removableId = removableRef.getAttribute("data-id");
    removeOption(Number(removableId), removableRef);
  }

  function handleInputBlur(e) {
    addOptions(e.target.value);
    input.value = "";
  }

  function handleInputKeyDown(e) {
    if (e.code == "Enter" || e.code == "Comma") {
      e.preventDefault();
      addOptions(e.target.value);
      input.value = "";
    }
  }

  function handleInnerClick() {
    input.focus();
  }

  function initialRender() {
    input = createElement({
      type: "input",
      props: {
        onBlur: handleInputBlur,
        onKeyDown: handleInputKeyDown,
        placeholder: "add more people…",
        class: "email-input__input",
      },
    });

    var innerChildren = options.map(function (o) {
      return createEmailItem(o, handleRemove);
    });
    innerChildren.push(input);

    inner = createElement({
      type: "div",
      props: {
        class: "email-input__inner",
        onClick: handleInnerClick,
        children: innerChildren,
      },
    });

    container.innerHTML = "";
    container.classList.add("email-input");
    render(inner, container);
  }

  init(initialOptions);
  initialRender();

  return {
    get() {
      return options;
    },
    add: addOptions,
    replace(options) {
      init(options);
      initialRender();
    },
    subscribe(cb) {
      subscribers.push(cb);
    },
  };
}

window.EmailsInput = EmailsInput;
