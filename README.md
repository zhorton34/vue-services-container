# vue-as-services
Vue JS Biasly Created To Simplify Vue JS and manage larger scale front-end applications


# Usage

1. Import 
```
import { CreateVueServiceContainer } from 'vue-as-services'
```

2. Create vue container

```
window.Container = VueServiceContainer(DEFAULT.options, DEFAULT.container)
```

3. Provide Register callbacks  

```
Container.registering(({ container, Vue }) => {
 	const $Event = new Vue()
 	$Event.listen = $Event.$on
 	$Event.fire = $Event.$emit
    $Event.listenOnce = $Event.$once 
    $Event.forget = $Event.$off 
    Vue.prototype['$Event'] = $Event
    container['$Event'] = $Event
})
```

4. Provide booting callbacks

```
Container.booting(({ container, Vue }) => {
   Vue.component('hello-world', {
	 data: () => ({ title: 'hello world' })
   })
})
```

5. Launch app with defined root instance
```
Container.launch({
 	el: '#app',
	name: 'vue-services-application',
})
```