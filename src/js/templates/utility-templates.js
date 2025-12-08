// Component and utility templates

// Generic component template
function createComponentTemplate(name, options = {}) {
  const {
    props = [],
    state = {},
    methods = [],
    template = '<div></div>',
    styles = '',
    dependencies = [],
    useShadowDOM = false
  } = options;

  let componentCode = '';
  
  // Add dependencies import
  if (dependencies.length > 0) {
    dependencies.forEach(dep => {
      componentCode += `import ${dep.name} from '${dep.path}';\n`;
    });
    componentCode += '\n';
  }

  // Create the component
  if (useShadowDOM) {
    componentCode += `// ${name} Component with Shadow DOM\n`;
    componentCode += `class ${name}Component extends HTMLElement {\n`;
    componentCode += '  constructor() {\n';
    componentCode += '    super();\n';
    componentCode += '    this.attachShadow({ mode: \'open\' });\n';
    
    // Initialize state
    for (const [key, value] of Object.entries(state)) {
      componentCode += `    this.${key} = ${JSON.stringify(value)};\n`;
    }
    
    componentCode += '  }\n\n';
    
    componentCode += '  connectedCallback() {\n';
    componentCode += '    this.render();\n';
    componentCode += '  }\n\n';
    
    // Add methods
    methods.forEach(method => {
      componentCode += `  ${method.name}(${method.params || ''}) {\n`;
      componentCode += `    ${method.body || '// Method implementation'}\n`;
      componentCode += '  }\n\n';
    });
    
    componentCode += '  render() {\n';
    componentCode += '    this.shadowRoot.innerHTML = `\n';
    componentCode += `      <style>\n${styles}\n      </style>\n`;
    componentCode += `      ${template}\n`;
    componentCode += '    `;\n';
    componentCode += '  }\n';
    componentCode += '}\n\n';
    componentCode += `customElements.define('${name.toLowerCase()}-component', ${name}Component);\n`;
  } else {
    componentCode += `// ${name} Component\n`;
    componentCode += 'function ' + name + 'Component(props = {}) {\n';
    componentCode += '  // Default props\n';
    props.forEach(prop => {
      componentCode += `  const ${prop.name} = props.${prop.name} || ${JSON.stringify(prop.default)};\n`;
    });
    componentCode += '\n';
    
    // Initialize state
    if (Object.keys(state).length > 0) {
      componentCode += '  // State\n';
      for (const [key, value] of Object.entries(state)) {
        componentCode += `  let ${key} = ${JSON.stringify(value)};\n`;
      }
      componentCode += '\n';
    }
    
    // Add methods
    if (methods.length > 0) {
      componentCode += '  // Methods\n';
      methods.forEach(method => {
        componentCode += `  function ${method.name}(${method.params || ''}) {\n`;
        componentCode += `    ${method.body || '// Method implementation'}\n`;
        componentCode += '  }\n\n';
      });
    }
    
    componentCode += '  // Template\n';
    componentCode += '  const element = document.createElement(\'div\');\n';
    componentCode += `  element.innerHTML = \`${template}\`;\n`;
    
    if (styles) {
      componentCode += '\n  // Add styles\n';
      componentCode += '  const style = document.createElement(\'style\');\n';
      componentCode += `  style.textContent = \`\n${styles}\n  \`;\n`;
      componentCode += '  element.appendChild(style);\n';
    }
    
    componentCode += '\n  return element;\n';
    componentCode += '}\n';
  }

  return componentCode;
}

// API template
function createAPITemplate(baseURL, endpoints = []) {
  let apiCode = `// API Service for ${baseURL}\n\n`;
  apiCode += `const API_BASE_URL = '${baseURL}';\n\n`;
  apiCode += 'class APIService {\n';
  apiCode += '  constructor() {\n';
  apiCode += '    this.baseURL = API_BASE_URL;\n';
  apiCode += '  }\n\n';
  
  endpoints.forEach(endpoint => {
    const { method, path, function: funcName, description = '' } = endpoint;
    apiCode += `  /**\n   * ${description}\n   */\n`;
    apiCode += `  async ${funcName}(${endpoint.params ? endpoint.params.join(', ') : ''}) {\n`;
    apiCode += '    const response = await fetch(`${this.baseURL}' + path + '`);\n';
    apiCode += '    if (!response.ok) {\n';
    apiCode += '      throw new Error(`HTTP error! status: ${response.status}`);\n';
    apiCode += '    }\n';
    apiCode += '    return response.json();\n';
    apiCode += '  }\n\n';
  });
  
  apiCode += '}\n\n';
  apiCode += 'export default new APIService();\n';
  
  return apiCode;
}

// Test template
function createTestTemplate(unitName, tests = []) {
  let testCode = `// Tests for ${unitName}\n\n`;
  testCode += 'function runTests() {\n';
  testCode += '  let passed = 0;\n';
  testCode += '  let total = 0;\n\n';
  
  tests.forEach(test => {
    testCode += `  function ${test.name}() {\n`;
    testCode += '    total++;\n';
    testCode += `    ${test.assertion}\n`;
    testCode += '    console.log(`✓ ${arguments.callee.name} passed`);\n';
    testCode += '    passed++;\n';
    testCode += '  }\n\n';
  });
  
  testCode += '  // Run tests\n';
  tests.forEach(test => {
    testCode += `  try {\n    ${test.name}();\n  } catch (e) {\n    console.error(`✗ ${test.name} failed:`, e.message);\n  }\n`;
  });
  
  testCode += '\n  console.log(`\\nResults: ${passed}/${total} tests passed`);\n';
  testCode += '}\n\n';
  testCode += 'runTests();\n';
  
  return testCode;
}

export { createComponentTemplate, createAPITemplate, createTestTemplate };