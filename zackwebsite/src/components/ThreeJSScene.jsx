
import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import typefaceFont from '../fonts/optimer_regular.typeface.json?url'

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


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
        const fontLoader = new FontLoader()
        fontLoader.load(
            typefaceFont,
            (font) => {
                const textGeometry = new TextGeometry(
                    "Welcome!",
                    {
                        font: font,
                        size: 0.5,
                        height: 0.2,
                        curveSegments: 5,
                        bevelEnabled: true,
                        bevelThickness: 0.10,
                        bevelSize: 0.01,
                        bevelOffset: 0,
                        bevelSegments: 2 
                    }
                )
                // textGeometry.computeBoundingBox()
                // textGeometry.translate(
                //     - textGeometry.boundingBox.max.x * 0.5,
                //     - textGeometry.boundingBox.max.y * 0.5,
                //     - textGeometry.boundingBox.max.z * 0.5
                // )
                textGeometry.center()

                const textMaterial = new THREE.MeshStandardMaterial({
                    color: '#FFD700',
                    metalness: 1,   // between 0 and 1
                    roughness: 0.25,
                })
                const axis = new THREE.Vector3(0,1,0)
                const text = new THREE.Mesh(textGeometry, textMaterial);
                text.rotateOnAxis(axis, Math.PI/4)
                text.position.y = 2.5
                house.add(text)
            }
        )

        const cubeTextureLoader = new THREE.CubeTextureLoader()
        const environmentMapTexture = cubeTextureLoader.load([
            './assets/EnvironmentMaps/Sunset/nx.png',
            './assets/EnvironmentMaps/Sunset/px.png',
            './assets/EnvironmentMaps/Sunset/py.png',
            './assets/EnvironmentMaps/Sunset/ny.png',
            './assets/EnvironmentMaps/Sunset/pz.png',
            './assets/EnvironmentMaps/Sunset/nz.png',
        ]) // order matters
        scene.environment = environmentMapTexture
        scene.background = new THREE.Color("#efdcc5")
        
        let modelPosition = 0
        let model = null
        
        // note the parts of the model we are looking for are Plane.002, Plane.003, Plane.004
        const gltfLoader = new GLTFLoader()
        gltfLoader.load(
            "./assets/House.glb",
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
         * Points
         */
        const points = [
            {
                position: new THREE.Vector3(0.15,0.6,0.15),
                element: document.querySelector(".point-0")
            }
        ]

        
        //const axesHelper = new THREE.AxesHelper( 5 );
        // scene.add( axesHelper );

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
        
        let laptopClicked = false
        window.addEventListener('click', () => {
            if(currentIntersect) {
                if (currentIntersect.length) {
                    for (const curr of currentIntersect) {
                        if (curr.object.name === "Plane002" || curr.object.name === "Plane003" || curr.object.name === "Plane004") {
                            if (laptopClicked === false) {
                                gsap.to( camera, {
                                    duration: 2,
                                    zoom: 2,
                                    onUpdate: () => {
                                        console.log(curr.object.position)
                                        camera.updateProjectionMatrix()
                                        laptopClicked = true
                                        points[0].element.classList.add('overlay')
                                    }
                                })
                            }
                            else {
                                gsap.to( camera, {
                                    duration: 2,
                                    zoom: 1,
                                    onUpdate: () => {
                                        console.log(curr.object.position)
                                        camera.updateProjectionMatrix()
                                        laptopClicked = false
                                        points[0].element.classList.remove('overlay')
                                    }
                                })
                            }
                            
                        
                            break; 
                        }
                    }
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
        const ambientLight = new THREE.AmbientLight(0xffc5a6, 1)
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
        directionalLight.shadow.camera.near = 2.5
        directionalLight.position.set(2, 2, 2)
        house.add(directionalLight)

        // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
        // scene.add(directionalLightHelper)

        // const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        // shadowCameraHelper.visible = true
        // scene.add(shadowCameraHelper)
        // Camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.set(2.5, 2, 2.5)
        // camera.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2)// doesn't work
        camera.lookAt(modelPosition) // idt this even works lol
        house.add(camera)


        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.VSMShadowMap
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

            // go through each point
            for(const point of points) {
                const screenPosition = point.position.clone()
                screenPosition.project(camera)

                raycaster.setFromCamera(screenPosition, camera)
                const intersects = raycaster.intersectObjects(scene.children, true)
                if(intersects.length === 0) {
                    point.element.classList.add('visible')
                } 
                else {
                    const intersectionDistance = intersects[0].distance
                    const pointDistance = point.position.distanceTo(camera.position)
                    if (intersectionDistance < pointDistance) {
                        point.element.classList.remove('visible')
                    }
                    else {
                        point.element.classList.add('visible')
                    }
                    
                }

                const translateX = screenPosition.x *  sizes.width* 0.5
                point.element.style.transform = `translateX(${translateX}px)`
                const translateY = -screenPosition.y *  sizes.height* 0.5
                point.element.style.transform = `translateX(${translateX}px)`
            }

            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        house.position.y = house.position.y - 0.3
        tick()
    }, [])

    return (
        <div ref={refContainer}></div>
    )
}

export default ThreeJSScene