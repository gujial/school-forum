import Vditor from 'vditor';
import { useColorMode } from '@vueuse/core';

const colorMode = useColorMode();
const renderMarkdown = (md, id) => {
  Vditor.preview(document.getElementById(id), md, {
    hljs: { style: colorMode.value === 'dark' ? 'github-dark' : 'github' },
    theme: {
      current: colorMode.value === 'dark' ? 'dark' : 'classic',
    },
    transform: (html) => {
      const imgRegex = /<img[^>]*>/g
      return html.replace(imgRegex, () => `[图片]`)
    }
  });
}

export default renderMarkdown;