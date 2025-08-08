'use client';

import React, { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import 'prismjs/components/prism-json';
import '@/app/code-editor.css';

export function CodeEditor({ 
  code, 
  language,
  onChange,
  initialValue,
}: { 
  code?: string;
  language: string;
  showLineNumbers?: boolean;
  onChange?: (value: string) => void;
  initialValue?: string;
}) {
  const { theme } = useTheme();
  const [themeString, setThemeString] = useState<string>("dark");
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(initialValue || code || '');
  
  function getThemeString() {
    if (theme === 'system') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return theme || 'dark';
  }

  useEffect(() => {
    if (mounted) {
      const currentTheme = getThemeString();
      setThemeString(currentTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Update local value when code prop changes
    if (code !== undefined) {
      setValue(code);
    }
  }, [code]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  if (!mounted) return null; // Prevents hydration error

  return (
    <div className="bg-secondary/50 rounded-md overflow-hidden">
      <div className="max-h-96 overflow-auto">
        <Editor
          value={value}
          onValueChange={handleValueChange}
          highlight={code => Prism.highlight(code, Prism.languages[language], language)}
          padding={16}
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.5,
            outline: 'none',
          }}
          textareaClassName="outline-none resize-none"
          className={cn(themeString === "light" ? "code-editor-light" : "code-editor-dark")}
        />
      </div>
    </div>
  );
}