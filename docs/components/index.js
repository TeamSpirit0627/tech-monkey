// @flow

import React from 'react';
import md from 'react-markings';

import ContentBlock from '../ContentBlock';
import { Code, CodeBlock } from '../styled-components';

const propFn = k => {
  const style = { display: 'inline-block', marginBottom: 6, marginRight: 4 };
  return (
    <span key={k} style={style}>
      <Code>{k}</Code>
    </span>
  );
};
const commonProps = [
  'clearValue',
  'getStyles',
  'getValue',
  'hasValue',
  'isMulti',
  'isRtl',
  'options',
  'selectOption',
  'setValue',
  'selectProps',
];

export default function Components() {
  return (
    <ContentBlock>{md`
      # Components

      The main feature of this library is providing consumers with the
      building blocks necessary to create _their_ component.

      ### Replacing Components

      React-Select allows you to augment layout and functionality by replacing
      the default components with your own, using the \`components\`
      property. These components are given all the current props and state
      letting you achieve anything you dream up.

      ### Inner Props

      All functional properties that the component needs are provided in
      \`innerProps\` which you must spread.

      ### Common Props

      Every component receives \`commonProps\` which are spread onto
      the component. These include:

      ${commonProps.map(propFn)}

      ${(
        <CodeBlock>
          {`import React from 'react';
import Select from 'react-select';

const CustomOption = ({ innerProps, isDisabled }) => !isDisabled ? (
  <div {...innerProps}>
    // your component internals
  </div>
) : null;

class Component extends React.Component {
  render() {
    return <Select components={{ Option: CustomOption }} />;
  }
}`}
        </CodeBlock>
      )}
    `}</ContentBlock>
  );
}
