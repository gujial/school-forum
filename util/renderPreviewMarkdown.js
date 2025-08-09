import Vditor from 'vditor';
import { useColorMode } from '@vueuse/core';

const colorMode = useColorMode();
const renderMarkdown = (md, id) => {
  Vditor.preview(document.getElementById(id), md, {
    hljs: { style: colorMode.value === 'dark' ? 'github-dark' : 'github' },
    theme: {
      current: colorMode.value === 'dark' ? 'dark' : 'classic',
    },
    transform: (element) => {
      const imgRegex = /<img[^>]*>/g;
      element = element.replace(imgRegex, (match) => `[图片]`);
      return element;
    }
  });
}

export default renderMarkdown;