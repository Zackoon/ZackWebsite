
import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


function ThreeJSScene() {
    const refContainer = useRef(null);

    useEffect(() => {
        // Scene
        const scene = new THREE.Scene()
        
        /**
         * Group
         */
        let house = new THREE.Group()
        scene.add(house)
        scene.position.y -= 0.5

        
        /**
         * Base
         */
        //let gui = new GUI()

        // Sizes
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        /**
         *  Loaders
         */
        const cubeTextureLoader = new THREE.CubeTextureLoader()
        const environmentMapTexture = cubeTextureLoader.load([
            './src/assets/EnvironmentMaps/Sunset/nx.png',
            './src/assets/EnvironmentMaps/Sunset/px.png',
            './src/assets/EnvironmentMaps/Sunset/py.png',
            './src/assets/EnvironmentMaps/Sunset/ny.png',
            './src/assets/EnvironmentMaps/Sunset/pz.png',
            './src/assets/EnvironmentMaps/Sunset/nz.png',
        ]) // order matters
        scene.environment = environmentMapTexture
        scene.background = new THREE.Color("#E6C8A3")
        
        let modelPosition = 0
        let model = null
        
        // note the parts of the model we are looking for are Plane.002, Plane.003, Plane.004

        const gltfLoader = new GLTFLoader()
        gltfLoader.load(
            "./src/assets/House.glb",
            (gltf) => {
                gltf.scene.traverse( function( node ) {

                    if ( node.isMesh ) { 
                        node.castShadow = true; 
                        node.receiveShadow = true;
                    }
            
                } );

                gltf.scene.position.set(-1.4, -0.2, -0.4)
                const axis = new THREE.Vector3(0,1,0)
                gltf.scene.rotateOnAxis(axis, -Math.PI/2)
                modelPosition = gltf.scene.position
                house.add(gltf.scene)
                console.log(gltf.scene)
                model = gltf.scene
            },
        )

        /**
         * Cursor
         */

        const mouse = new THREE.Vector2()
        window.addEventListener('mousemove', (e) =>
        {
            mouse.x = e.clientX/sizes.width * 2 - 1
            mouse.y = - (e.clientY/sizes.height * 2 - 1)
        })

        /**
         * Raycasting
         */
        const raycaster = new THREE.Raycaster()
        let currentIntersect = null
        

        window.addEventListener('click', () => {
            if(currentIntersect) {
                if (currentIntersect.length) {
                    console.log('clicked!')
                }
            }
        })

        /**
         * Environment Mapping
         */
        const updateAllMaterials = () =>
        {
            scene.traverse((child) =>
            {
                if(child.isMesh && child.material.isMeshStandardMaterial)
                {
                    child.material.envMapIntensity = 10
                }
            })
        }
        updateAllMaterials()

        /**
         * Lights
         */

        // should be ff8e61 tho
        const ambientLight = new THREE.AmbientLight(0xffc5a6, 4)
        house.add(ambientLight)
        //gui.addColor(ambientLight, "color")

        const spotLight = new THREE.SpotLight(0xff9000, 25, 2.3, Math.PI*0.1, 1, 1)
        spotLight.position.set(-0.34,1.13,0.2)
        house.add(spotLight)
        spotLight.target.position.set(1.18, 0, 1.33)
        house.add(spotLight.target)

        // const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0.5)
        // house.add(spotLightHelper)

        const directionalLight = new THREE.DirectionalLight(0xFFCEA6, 5)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(2048, 2048)
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.camera.left = - 7
        directionalLight.shadow.camera.top = 7
        directionalLight.shadow.camera.right = 7
        directionalLight.shadow.camera.bottom = - 7
        directionalLight.position.set(2, 2, 2)
        house.add(directionalLight)

        // Camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.set(2.5, 2, 2.5)
        camera.lookAt(modelPosition)
        house.add(camera)


        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Add in the renderer to the ref
        if (refContainer.current) {
            if (refContainer.current.childElementCount == 0) {
                refContainer.current.appendChild( renderer.domElement );
            }
        }

        // Controls
        let controls;

        if (refContainer.current) {
            controls = new OrbitControls(camera, refContainer.current);
            controls.enableDamping = true;
        }


        window.addEventListener('resize', () =>
        {
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            // Update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

        // Animate
        const clock = new THREE.Clock()

        const tick = () =>
        {
            const elapsedTime = clock.getElapsedTime()
            
            // ray cast
            raycaster.setFromCamera(mouse, camera)
            if (model) {
                currentIntersect = raycaster.intersectObject(model)
            }
            

            // update controls
            if (controls) {controls.update()} 

            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }
        tick()
    })

    return (
        <div ref={refContainer}></div>
    )
}

export default ThreeJSScene