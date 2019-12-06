import GlobalVueClass from 'vue'

class VueServiceContainer {
    constructor(config = {}, container) {
        this.Vue = GlobalVueClass
        this.config = config

        this.setRootInstance()

        this.bootingCallbacks = []
        this.registeringCallbacks = []
        this.afterLaunchingCallbacks = []

        this.addedBootParameters = {}
        this.addedRegisterParameters = {}
        this.addedAfterLaunchParameters = {}


        const _this = this
        if (container) {
            this.bootingCallbacks = [...container.bootingCallbacks, ...this.bootingCallbacks]
            this.registeringCallbacks = [...container.registeringCallbacks, ...this.registeringCallbacks]
            const rootInstanceOptions = container.root || { options: {} } 
            const { root } = this
            this.root.options = { ...root.options, ...rootInstanceOptions }
        }
    }

    /**
     * Set Vue Global Api Instance
     */ 
    setVue(CustomGlobalVueApi) {
        this.Vue = CustomGlobalVueApi
    }

    /**
     * Set overidable root instance
     */
    setRootInstance() {
        this.root = {
            options: {
                el: '#app',
                name: 'vue-service-container',
                data: () => ({}),
                mixins: [],
                methods: {},
                filters: {},
                computed: {},
                directives: {}
            },
            set(options = {}) {
                Object.entries(options).forEach(([key, setting]) => {
                    this.add(key, setting)
                })
            },
            addVuex(store) {
                this.options.store = store
            },
            add(key, setting = false) {
                const notAnOption = !Object.keys(this.options).includes(key)
                
                if (notAnOption || !setting) return

                const settingIsArray = Array.isArray(setting)
                const settingIsObject = typeof setting === 'object'
                const settingIsAString = typeof setting === 'string'
                const settingIsAFunction = typeof setting === 'function'

                if (settingIsAString) {
                    this.options[key] = setting
                }
                if (settingIsArray) {
                    this.options[key] = [
                        ...setting,
                        ...this.options[key]
                    ]
                }
                if (settingIsAFunction) {
                    const old = this.options[key]();
                    const append = setting();
                    this.options[key] = () => {
                        return { ...old, ...append }
                    }
                }
                if (settingIsObject && !settingIsArray) {
                    this.options[key] = {
                        ...setting,
                        ...this.options[key]
                    }
                }
            },
        }
    }



    /**
     *  Register parameters that are available within the Container booting callback
     *  Container.booting(({ ...parametersReturnedHere }))
     */
    setRegisteringParameters(args = {}) {
        const container = this
        const { Vue, config, root } = this

        this.registerParameters = { Vue, container, root, config, ...this.addedRegisterParameters }
    }
    /**
     *  Register parameters that are available within the Container booting callback
     *  Container.booting(({ ...parametersReturnedHere }))
     */
    setBootingParameters(args = {}) {
        const container = this
        const { Vue, config, root } = this 

        this.bootParameters = { Vue, container, root, config, ...this.addedBootParameters }
    }
    /**
     * Set After Launching Parameters
     */
    setAfterLaunchParameters() {
        const { Vue, config, app } = this

        this.afterLaunchingParameters = { Vue, config, app, ...this.addedAfterLaunchParameters }
    }



    /**
     * Add additional booting callback parameters
     */
    addBootParameters(args = {}) {
        this.addedBootParameters = { ...this.addedBootParameters, ...args }
    }
    /**
     * Add additional registering callback parameters
     */
    addRegisterParameters(args = {}) {
        this.addedRegisterParameters = { ...this.addedRegisterParameters, ...args }
    }
    /**
     * Add additional afterLaunch callback parameters
     */
    addAfterLaunchParameters(args = {}) {
        this.addedAfterLaunchParameters = { ...this.addedAfterLaunchParameters, ...args }
    }


    /**
     * Register a callback to be called before Container boots.
     * This is used to register Container properties and relationships
     */
    registering(callback) {
        this.registeringCallbacks.push(callback)
    }
    /**
     * Register a callback to be called before Container Instance Launches But After Register Callbacks. This is used to bootstrap
     * add ons, tools, custom fields, or anything else Container needs
     */
    booting(callback) {
        this.bootingCallbacks.push(callback)
    }
    /**
     * Regiseter a callback to be called after launch
     */
    afterLaunching(callback) {
        this.afterLaunchingCallbacks.push(callback)
    }


    /**
     * Execute all of the booting callbacks.
     */
    boot() {
        this.bootingCallbacks.forEach(callback => callback(this.bootParameters))
        this.bootingCallbacks = []
    }
    /**
     * Execute all of the register callbacks.
     */
    register() {
        this.registeringCallbacks.forEach(callback => callback(this.registerParameters))
        this.registeringCallbacks = []
    }
    /**
     * Execute all afterLaunch callbacks
     */
     afterLaunch() {
        this.afterLaunchingCallbacks.forEach(callback => callback(this.afterLaunchingParameters))
        this.afterLaunchingCallbacks = []
     }


    /**
     * Start the Container vue app instance by calling each of the callbacks and then creating
     * the underlying Vue instance.
     */
    launch(withRootInstanceOptions = false) {
        // register callbacks to register things that boot callbacks depend on
        this.setRegisteringParameters()
        this.register()

        // boot callbacks depend on internally registered properties on Container
        this.setBootingParameters()
        this.boot()

        const { root, Vue } = this

        if (withRootInstanceOptions) {
            console.warn('you can configure your root instance within launch, but the launc vue instance options will override any parrellel root (vue instance) options set in your booting or registering callbacks')
            this.root.set(withRootInstanceOptions)
        }

        if (this.root.options.render) {
            const { el } = this.root.options
            this.app = new Vue(this.root.options).$mount(el)
        }
        else {
            this.app = new Vue(this.root.options)
        }

        // after launch callbacks
        this.setAfterLaunchParameters()
        this.afterLaunch()
    }
}


;(function() {
    this.CreateVueApp = function(config = {}, container = false) {
        return new VueServiceContainer(config, container)        
    }
}.call(window))

exports.CreateVueServiceContainer = function(config = {}, container = false) {
    return CreateVueApp(config, container)
}

