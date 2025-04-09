export const FileManagerMessage = {
  ja: {
    move: '移動',
    view: '表示',
    edit: '編集',
    delete: '削除',
    do: '実行',
  },
  en: {
    move: 'move',
    view: 'view',
    edit: 'edit',
    delete: 'delete',
    do: 'do',
  },
} as const;

export type FileManagerMessage =
  | (typeof FileManagerMessage)[keyof Omit<typeof FileManagerMessage, 'ja'>]
  | (typeof FileManagerMessage)['ja'][keyof (typeof FileManagerMessage)['ja']]
  | (typeof FileManagerMessage)[keyof Omit<typeof FileManagerMessage, 'en'>]
  | (typeof FileManagerMessage)['en'][keyof (typeof FileManagerMessage)['en']];
