import type { Meta, StoryObj } from '@storybook/react';

import Clock from '../index';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Clock',
  component: Clock,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'radio',
      options: ['left', 'center', 'right'],
    },
    hourFormat: {
      control: 'radio',
      options: ['auto', '12', '24'],
    },
  },
} satisfies Meta<typeof Clock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    align: 'left',
    hourFormat: 'auto',
  },
};

export const Centered12Hour: Story = {
  args: {
    align: 'center',
    hourFormat: '12',
  },
};
