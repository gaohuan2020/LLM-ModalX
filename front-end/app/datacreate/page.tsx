'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Section {
    title: string;
    description: string;
    required: boolean;
    note?: string;
}

export default function DataCreate() {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [loadingText, setLoadingText] = useState('Generating content...');
    const [isConverting, setIsConverting] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [config, setConfig] = useState({
        description: "The report structure should focus on breaking-down the user-provided topic",
        structure: [
            {
                title: "Introduction",
                description: "- Brief overview of the topic area",
                required: true,
                note: "(no research needed)"
            },
            {
                title: "Main Body Sections",
                description: "- Each section should focus on a sub-topic of the user-provided topic\n- Include any key concepts and definitions\n- Provide real-world examples or case studies where applicable",
                required: true,
                note: "No sections other than ones dedicated to each company"
            },
            {
                title: "Conclusion",
                description: "- Aim for 1 structural element (either a list of table) that distills the main body sections\n- Provide a concise summary of the report",
                required: true
            }
        ]
    });
    const [editingSection, setEditingSection] = useState<{ section: Section, index: number } | null>(null);

    const insertMarkdown = (prefix: string, suffix = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.slice(start, end);
        const newContent =
            content.slice(0, start) +
            prefix +
            selectedText +
            suffix +
            content.slice(end);

        setContent(newContent);

        // Reset cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length
            );
        }, 0);
    };

    const toolbarItems = [
        { label: 'B', action: () => insertMarkdown('**', '**'), title: 'Bold' },
        { label: 'I', action: () => insertMarkdown('*', '*'), title: 'Italic' },
        { label: 'H1', action: () => insertMarkdown('# '), title: 'Heading 1' },
        { label: 'H2', action: () => insertMarkdown('## '), title: 'Heading 2' },
        { label: '←', action: () => insertMarkdown('::: left\n', '\n:::'), title: 'Left Align' },
        { label: '→', action: () => insertMarkdown('::: right\n', '\n:::'), title: 'Right Align' },
        { label: '↔', action: () => insertMarkdown('::: center\n', '\n:::'), title: 'Center Align' },
        { label: 'Link', action: () => insertMarkdown('[', '](url)'), title: 'Link' },
        { label: '•', action: () => insertMarkdown('- '), title: 'List' },
        { label: '1.', action: () => insertMarkdown('1. '), title: 'Numbered List' },
        { label: '```', action: () => insertMarkdown('```\n', '\n```'), title: 'Code Block' },
        {
            label: 'Table',
            action: () => insertMarkdown(
                '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |'
            ),
            title: 'Insert Table'
        },
    ];

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const configToString = () => {
        return `${config.description}\n\nThe report structure should include:\n` +
            config.structure.map((section, index) => {
                const noteText = section.note ? ` (${section.note})` : '';
                return `${index + 1}. ${section.title}${noteText}\n${section.description}`;
            }).join('\n\n');
    };

    const handleGenerate = async () => {
        if (!title.trim()) {
            alert('Please enter a title first');
            return;
        }

        setIsGenerating(true);
        const loadingMessages = [
            'Analyzing topic...',
            'Gathering information...',
            'Structuring content...',
            'Generating insights...',
            'Finalizing document...'
        ];
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            setLoadingText(loadingMessages[messageIndex % loadingMessages.length]);
            messageIndex++;
        }, 3000);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 600000);

            const response = await fetch('http://45.252.106.202:5000/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    config: configToString()
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Generation failed');
            }

            const data = await response.json();
            setContent(data.content);
        } catch (err: unknown) {
            console.error('Generation error:', err);
            const error = err as Error;
            if (error instanceof Error && error.name === 'AbortError') {
                alert('Generation timed out after 5 minutes. Please try again with a simpler request.');
            } else {
                alert(error instanceof Error ? error.message : 'Failed to generate content. Please try again.');
            }
        } finally {
            clearInterval(messageInterval);
            setIsGenerating(false);
        }
    };

    // 处理自定义对齐语法
    const processAlignmentSyntax = (content: string) => {
        const alignRegex = /^::: (left|right|center)\n([\s\S]*?)\n:::/gm;
        return content.replace(alignRegex, (_, align, text) => {
            return `<div class="text-${align}">${text.trim()}</div>`;
        });
    };

    const handleDownload = async () => {
        if (!content) {
            alert('Please generate or write some content first');
            return;
        }

        try {
            const response = await fetch('http://45.252.106.202:5000/api/convert-to-docx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    markdown: content,
                    title: title || 'document'
                }),
            });

            if (!response.ok) {
                throw new Error('Conversion failed');
            }

            // Get the blob from the response
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'document'}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download Word document. Please try again.');
        }
    };

    const handleConvertToPodcast = async () => {
        if (!content) {
            alert('Please generate or write some content first');
            return;
        }

        setIsConverting(true);
        try {
            const response = await fetch('http://45.252.106.202:5000/api/convert-to-podcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: content,
                    title: title || 'podcast'
                }),
            });

            if (!response.ok) {
                throw new Error('Conversion failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'podcast'}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Podcast conversion error:', error);
            alert('Failed to convert to podcast. Please try again.');
        } finally {
            setIsConverting(false);
        }
    };

    const handleAddSection = () => {
        setConfig(prev => ({
            description: prev.description,
            structure: [
                ...prev.structure,
                {
                    title: "New Section",
                    description: "Add description here",
                    required: false
                }
            ]
        }));
    };

    const handleDeleteSection = (index: number) => {
        if (config.structure[index].required) {
            alert("Cannot delete required sections");
            return;
        }
        setConfig(prev => ({
            description: prev.description,
            structure: prev.structure.filter((_, i) => i !== index)
        }));
    };

    const handleEditSection = (section: Section, index: number) => {
        setEditingSection({ section: { ...section }, index });
    };

    return (
        <div className="p-6 relative">
            {isGenerating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
                        <div className="w-16 h-16 relative">
                            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-800">{loadingText}</p>
                            <p className="text-sm text-gray-500 mt-1">This may take a few minutes</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Configuration Modal */}
            {showConfig && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Report Configuration</h2>
                            <button
                                onClick={() => setShowConfig(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Description Field */}
                        <div className="mb-8">
                            <label className="block text-base font-medium text-gray-700 mb-3">
                                Report Description
                            </label>
                            <textarea
                                value={config.description}
                                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-3 border rounded-lg h-32 text-base"
                                placeholder="Enter report description..."
                            />
                        </div>

                        <div className="space-y-6">
                            {config.structure.map((section, index) => (
                                <div key={index} className="border rounded-lg p-6">
                                    {editingSection?.index === index ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editingSection.section.title}
                                                onChange={(e) => {
                                                    setEditingSection(prev => prev ? {
                                                        ...prev,
                                                        section: { ...prev.section, title: e.target.value }
                                                    } : null);
                                                }}
                                                className="w-full px-3 py-2 border rounded-md"
                                                placeholder="Section title"
                                            />
                                            <textarea
                                                value={editingSection.section.description}
                                                onChange={(e) => {
                                                    setEditingSection(prev => prev ? {
                                                        ...prev,
                                                        section: { ...prev.section, description: e.target.value }
                                                    } : null);
                                                }}
                                                className="w-full px-3 py-2 border rounded-md h-24"
                                                placeholder="Section description"
                                            />
                                            <input
                                                type="text"
                                                value={editingSection.section.note || ''}
                                                onChange={(e) => {
                                                    setEditingSection(prev => prev ? {
                                                        ...prev,
                                                        section: { ...prev.section, note: e.target.value }
                                                    } : null);
                                                }}
                                                className="w-full px-3 py-2 border rounded-md"
                                                placeholder="Additional note (optional)"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingSection(null)}
                                                    className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (editingSection) {
                                                            setConfig(prev => ({
                                                                description: prev.description,
                                                                structure: prev.structure.map((s, i) =>
                                                                    i === editingSection.index ? editingSection.section : s
                                                                )
                                                            }));
                                                            setEditingSection(null);
                                                        }
                                                    }}
                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-800">
                                                        {section.title}
                                                        {section.note && <span className="text-sm text-gray-500 ml-2">({section.note})</span>}
                                                    </h3>
                                                    {section.required && (
                                                        <span className="text-xs text-red-500">(Required)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditSection(section, index)}
                                                        className="text-gray-500 hover:text-gray-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    {!section.required && (
                                                        <button
                                                            onClick={() => handleDeleteSection(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 whitespace-pre-line">{section.description}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={handleAddSection}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg 
                          hover:bg-blue-700 transition-colors duration-200 
                          flex items-center gap-2 text-base"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Section
                            </button>
                            <button
                                onClick={() => setShowConfig(false)}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg 
                          hover:bg-gray-200 transition-colors duration-200 text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            className="text-2xl font-bold px-3 py-2 border-b border-gray-200 flex-grow 
                         focus:outline-none focus:border-blue-500 bg-transparent"
                            placeholder="Enter topic..."
                            onChange={handleTitleChange}
                            value={title}
                        />
                        <button
                            onClick={() => setShowConfig(true)}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg
                       hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Configure</span>
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg 
                         transition-colors duration-200 flex items-center gap-2 shadow-sm
                         ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                        >
                            <span>
                                {isGenerating ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Generating...
                                    </div>
                                ) : (
                                    'Generate'
                                )}
                            </span>
                            {!isGenerating && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Editor Section */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="border-b border-gray-100">
                            <div className="flex items-center gap-1 p-2">
                                {toolbarItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={item.action}
                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md
                             transition-colors duration-200"
                                        title={item.title}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="w-full h-[calc(100vh-400px)] p-4 font-mono text-gray-800
                       focus:outline-none resize-none"
                            placeholder="# Start writing here..."
                            onChange={(e) => setContent(e.target.value)}
                            value={content}
                        />
                    </div>

                    {/* Preview Section */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="border-b border-gray-100 p-2">
                            <h3 className="text-sm font-medium text-gray-600 px-2">Preview</h3>
                        </div>
                        <div className="w-full h-[calc(100vh-400px)] p-8 overflow-auto prose prose-lg max-w-none 
                  prose-headings:font-display prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-li:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ node, ...props }) => (
                                        <h1 {...props} className="text-center text-3xl font-bold mb-8 text-gray-900" />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2 {...props} className="text-center text-2xl font-semibold mb-6 text-gray-800" />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3 {...props} className="text-center text-xl font-medium mb-5 text-gray-800" />
                                    ),
                                    h4: ({ node, ...props }) => (
                                        <h4 {...props} className="text-center text-lg font-medium mb-4 text-gray-800" />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p {...props} className="mb-4 text-lg leading-relaxed" />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul {...props} className="mb-6 ml-6 space-y-2" />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol {...props} className="mb-6 ml-6 space-y-2" />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li {...props} className="text-lg text-gray-700" />
                                    ),
                                    table: ({ node, ...props }) => (
                                        <div className="my-6 overflow-x-auto">
                                            <table {...props} className="min-w-full border-collapse border border-gray-300 bg-white" />
                                        </div>
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th {...props} className="border border-gray-300 bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900" />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td {...props} className="border border-gray-300 px-6 py-4 text-sm text-gray-700" />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic my-6 text-gray-700" />
                                    ),
                                    code: ({ node, inline, ...props }: { node?: any, inline?: boolean } & React.HTMLProps<HTMLElement>) => (
                                        inline ?
                                            <code {...props} className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-gray-800" /> :
                                            <code {...props} className="block bg-gray-100 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto" />
                                    ),
                                    div: ({ node, className, children, ...props }) => {
                                        return <div className={`${className} my-4`} {...props}>{children}</div>;
                                    },
                                }}
                            >
                                {processAlignmentSyntax(content)}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Download Buttons */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={handleConvertToPodcast}
                        disabled={isConverting}
                        className={`px-4 py-2 bg-purple-600 text-white rounded-lg 
                       transition-colors duration-200 flex items-center gap-2 shadow-sm
                       ${isConverting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
                    >
                        {isConverting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span>Converting...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                </svg>
                                <span>Convert to Podcast</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg 
                      hover:bg-green-700 transition-colors duration-200 
                      flex items-center gap-2 shadow-sm"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        <span>Download Word</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
