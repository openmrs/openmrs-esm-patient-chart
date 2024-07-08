import * as React from 'react';
import { makeThrottled } from '../helpers';

const useScrollIndicator = (xThreshold: number, yThreshold: number): [boolean, boolean, React.Ref<HTMLElement>, string] => {
  const [xIsScrolled, setXIsScrolled] = React.useState(false);
  const [yIsScrolled, setYIsScrolled] = React.useState(false);
  const [currentTitle, setCurrentTitle] = React.useState('');

  const ref = React.useCallback(
    (element) => {
      if (!element) {
        return;
      }

      const scrollHandler = makeThrottled(() => {
        setXIsScrolled(element.scrollLeft > xThreshold);
        setYIsScrolled(element.scrollTop > yThreshold);
      }, 200);

      element.addEventListener('scroll', scrollHandler);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setCurrentTitle(entry.target.getAttribute('title'));
          }
        });
      }, {
        root: element,
        threshold: 1.0
      });

      const titleElements = element.querySelectorAll('.title');
      titleElements.forEach(el => observer.observe(el));

      return () => {
        element.removeEventListener('scroll', scrollHandler);
        titleElements.forEach(el => observer.unobserve(el));
      };
    },
    [xThreshold, yThreshold],
  );

  return [xIsScrolled, yIsScrolled, ref, currentTitle];
};

export default useScrollIndicator;
