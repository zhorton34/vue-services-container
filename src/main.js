import Vue from 'vue'
var exports=module.exports={};

require('@Boot/vue-service-container')

const DEFAULT = {
	options: {
		info: 'options object can be data passed in from php and json encoded so you can use php data in your register or boot callbacks',
		app: {
			title: 'Example Title',
			description: 'Example Description'
		}
	},
	container: {
		bootingCallbacks: [],
		registeringCallbacks: [],
 		rootInstanceOptions: {
 			el: '#app',
 			name: 'vue-services-container',
 		}
	}
}


window.Container = CreateVueServiceContainer(DEFAULT.options, DEFAULT.container)

Container.setVue(Vue)

Container.registering(({ container, Vue }) => {
	const $Event = new Vue()
	$Event.listen = $Event.$on
	$Event.fire = $Event.$emit
	$Event.listenOnce = $Event.$once 
	$Event.forget = $Event.$off 
	Vue.prototype['$Event'] = $Event
	container['$Event'] = $Event
})

Container.booting(({ container, Vue }) => {
	Vue.component('hello-world', {
		data: () => ({ title: 'hello world' })
	})
})

Container.launch({
	el: '#app',
	name: 'vue-service-container',
})


