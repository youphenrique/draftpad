// @ts-check

/**
 * @typedef {Object} StorageArea
 * @property {(keys: string | string[] | Object | null, callback: (items: Object) => void) => void} get
 * @property {(keys: Object, callback: () => void) => void} set
 */

/**
 * @typedef {Object} BrowserStorage
 * @property {StorageArea} local
 */

/**
 * @typedef {Object} BrowserTabs
 * @property {(createProperties: {url?: string}) => void} create
 */

/**
 * @typedef {Object} BrowserAction
 * @property {{ addListener: (callback: () => void) => void }} onClicked
 */

/**
 * @typedef {Object} BrowserCommands
 * @property {{ addListener: (callback: (command: string) => void) => void }} onCommand
 */

/**
 * @typedef {Object} BrowserAPI
 * @property {BrowserStorage} storage
 * @property {BrowserTabs} tabs
 * @property {BrowserAction} action
 * @property {BrowserCommands} commands
 */

/**
 * @type {BrowserAPI}
 */
// @ts-ignore
let chrome;

/**
 * @type {BrowserAPI}
 */
// @ts-ignore
let browser;


/** --- GLOBALS FOR DRAFTPAD --- */
