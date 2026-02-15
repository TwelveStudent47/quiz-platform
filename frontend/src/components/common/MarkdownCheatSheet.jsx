import React from 'react';

const MarkdownCheatSheet = () => {
    const examples = [
        { label: 'Félkövér', syntax: '**szöveg**', result: <span className="font-bold">szöveg</span> },
        { label: 'Dőlt', syntax: '*szöveg*', result: <span className="italic">szöveg</span> },
        { label: 'Áthúzott', syntax: '~~szöveg~~', result: <span className="line-through">szöveg</span> },
        { label: 'Kód (inline)', syntax: '`kód`', result: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">kód</code> },
        { label: 'Link', syntax: '[Link szöveg](url)', result: <span className="text-blue-500 underline">Link szöveg</span> },
        { label: 'Lista', syntax: '- Elem 1\n- Elem 2', result: <ul className="list-disc list-inside"><li>Elem 1</li><li>Elem 2</li></ul> },
        { label: 'Számozott lista', syntax: '1. Első\n2. Második', result: <ol className="list-decimal list-inside"><li>Első</li><li>Második</li></ol> },
        { label: 'Idézet', syntax: '> Idézet', result: <div className="border-l-4 border-gray-300 pl-2 italic">Idézet</div> },
        { label: 'Fejléc 1', syntax: '# Címsor', result: <span className="text-xl font-bold">Címsor</span> },
        { label: 'Fejléc 2', syntax: '## Alcím', result: <span className="text-lg font-bold">Alcím</span> },
    ];

    return (
        <div className="overflow-hidden">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                A kérdések és magyarázatok szövegében használhatod az alábbi formázásokat:
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Leírás
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Így írd be
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Így jelenik meg
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {examples.map((item, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {item.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-900/30 rounded">
                                    {item.syntax.split('\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    {item.result}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Hasznos tippek:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Új sorhoz nyomj <strong>két szóközt</strong> a sor végén, majd Entert.</li>
                    <li>Kódblokkhoz használd a <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">```</code> karaktereket a kód előtt és után.</li>
                    <li>A táblázatok is támogatottak!</li>
                </ul>
            </div>
        </div>
    );
};

export default MarkdownCheatSheet;
