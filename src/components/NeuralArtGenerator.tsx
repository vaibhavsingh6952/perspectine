'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function NeuralArtGenerator() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    class WaterDroplet {
      scene!: THREE.Scene
      camera!: THREE.PerspectiveCamera
      renderer!: THREE.WebGLRenderer
      mouse!: THREE.Vector2
      raycaster!: THREE.Raycaster
      isMouseDown!: boolean
      previousMousePosition!: { x: number; y: number }
      geometry!: THREE.SphereGeometry
      material!: THREE.MeshPhysicalMaterial
      droplet!: THREE.Mesh
      originalPositions!: Float32Array
      time!: number
      deformationStrength!: number
      targetDeformation!: number
      morphSpeed!: number
      floatSpeed!: number
      rotationSpeed!: number
      surfaceTension!: number
      viscosity!: number
      perturbations!: Array<{ point: THREE.Vector3; strength: number; time: number }>
      dents!: Array<{ point: THREE.Vector3; strength: number; time: number }>
      chaosLevel!: number
      turbulenceStrength!: number
      jitterFactor!: number

      constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio of 1
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.isMouseDown = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        this.init();
        this.createDroplet();
        this.setupLighting();
        this.setupEventListeners();
        this.animate();
      }
      
      init() {
        const container = containerRef.current;
        if (!container) return;

        const size = Math.min(container.clientWidth, container.clientHeight);
        this.renderer.setSize(size, size);
        this.renderer.setClearColor(0x051209, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        this.camera.position.set(0, 0, 5);
        this.scene.fog = new THREE.Fog(0x051209, 8, 15);
      }
      
      createDroplet() {
        this.geometry = new THREE.SphereGeometry(1, 64, 64);
        this.originalPositions = new Float32Array(this.geometry.attributes.position.array);
        
        // Create realistic water material
        this.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          transmission: 0.7,
          thickness: 0.8,
          roughness: 0.1,
          metalness: 0.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          ior: 1.33,
          reflectivity: 0.8,
          envMapIntensity: 1.5
        });
        
        this.droplet = new THREE.Mesh(this.geometry, this.material);
        this.droplet.castShadow = true;
        this.droplet.receiveShadow = true;
        this.scene.add(this.droplet);
        
        // Animation properties
        this.time = 0;
        this.deformationStrength = 0;
        this.targetDeformation = 0;
        this.morphSpeed = 0.035;
        this.floatSpeed = 0.8;
        this.rotationSpeed = 0.004;
        
        this.surfaceTension = 0.75;
        this.viscosity = 0.85;
        this.perturbations = [];
        this.dents = [];
        
        this.chaosLevel = 0.6;
        this.turbulenceStrength = 0.08;
        this.jitterFactor = 0.03;
      }
      
      setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Rim light for water effect
        const rimLight = new THREE.DirectionalLight(0x4dd0e1, 0.8);
        rimLight.position.set(-3, 2, -3);
        this.scene.add(rimLight);
        
        // Point light for sparkle effect
        const pointLight = new THREE.PointLight(0xffffff, 0.6, 10);
        pointLight.position.set(2, 3, 2);
        this.scene.add(pointLight);
        
        this.createEnvironmentMap();
      }
      
      createEnvironmentMap() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#4682B4');
        gradient.addColorStop(1, '#191970');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.environment = texture;
        this.material.envMap = texture;
      }
      
      setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('mouseup', () => this.onMouseUp());
      }
      
      onWindowResize() {
        this.camera.aspect = 1;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(Math.min(containerRef.current!.clientWidth, containerRef.current!.clientHeight), Math.min(containerRef.current!.clientWidth, containerRef.current!.clientHeight));
      }
      
      onMouseClick(event: MouseEvent) {
        this.mouse.x = (event.clientX / containerRef.current!.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / containerRef.current!.clientHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.droplet);
        
        if (intersects.length > 0) {
          const point = intersects[0].point;
          this.addDent(point);
          this.targetDeformation = Math.min(this.targetDeformation + 0.9, 2.2);
          this.addPerturbation(point);
          this.addRandomPerturbation();
        } else {
          this.targetDeformation = Math.min(this.targetDeformation + 0.7, 2.2);
          this.addRandomDent();
          this.addRandomPerturbation();
          this.addRandomPerturbation();
        }
      }
      
      onMouseDown(event: MouseEvent) {
        this.isMouseDown = true;
        this.previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      }
      
      onMouseMove(event: MouseEvent) {
        if (this.isMouseDown) {
          const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
          };
          
          const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
              deltaMove.y * 0.008,
              deltaMove.x * 0.008,
              0,
              'XYZ'
            ));
          
          this.droplet.quaternion.multiplyQuaternions(
            deltaRotationQuaternion,
            this.droplet.quaternion
          );
          
          this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
          };
        }
      }
      
      onMouseUp() {
        this.isMouseDown = false;
      }
      
      addDent(point: THREE.Vector3) {
        this.dents.push({
          point: point.clone(),
          strength: 0.8,
          time: 0
        });
      }
      
      addRandomDent() {
        const randomPoint = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize();
        
        this.dents.push({
          point: randomPoint,
          strength: Math.random() * 0.6,
          time: 0
        });
      }
      
      addPerturbation(point: THREE.Vector3) {
        this.perturbations.push({
          point: point.clone(),
          strength: 0.4,
          time: 0
        });
      }
      
      addRandomPerturbation() {
        const randomPoint = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize();
        
        this.perturbations.push({
          point: randomPoint,
          strength: Math.random() * 0.3,
          time: 0
        });
      }
      
      updateDeformation() {
        const positions = this.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const vertex = new THREE.Vector3(
            this.originalPositions[i],
            this.originalPositions[i + 1],
            this.originalPositions[i + 2]
          );
          
          let deformation = 0;
          
          // Apply dents
          for (const dent of this.dents) {
            const distance = vertex.distanceTo(dent.point);
            if (distance < 0.5) {
              const strength = dent.strength * (1 - distance / 0.5);
              deformation += strength * Math.sin(dent.time * 2);
            }
          }
          
          // Apply perturbations
          for (const perturbation of this.perturbations) {
            const distance = vertex.distanceTo(perturbation.point);
            if (distance < 0.3) {
              const strength = perturbation.strength * (1 - distance / 0.3);
              deformation += strength * Math.sin(perturbation.time * 3);
            }
          }
          
          // Apply surface tension and viscosity
          deformation *= this.surfaceTension;
          deformation = Math.max(-0.5, Math.min(0.5, deformation));
          
          // Update vertex position
          positions[i] = vertex.x + deformation * vertex.x;
          positions[i + 1] = vertex.y + deformation * vertex.y;
          positions[i + 2] = vertex.z + deformation * vertex.z;
        }
        
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
      }
      
      updateStats() {
        const deformLevel = document.getElementById('deformLevel');
        const tensionLevel = document.getElementById('tensionLevel');
        const viscosityLevel = document.getElementById('viscosityLevel');
        
        if (deformLevel) {
          deformLevel.textContent = Math.round(this.deformationStrength * 100).toString();
        }
        if (tensionLevel) {
          tensionLevel.textContent = this.surfaceTension < 0.8 ? 'Low' : 'High';
        }
        if (viscosityLevel) {
          viscosityLevel.textContent = this.viscosity < 0.9 ? 'Reduced' : 'Normal';
        }
      }
      
      animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        // Update deformation
        this.deformationStrength += (this.targetDeformation - this.deformationStrength) * 0.1;
        this.updateDeformation();
        
        // Update dents and perturbations
        this.dents = this.dents.filter(dent => {
          dent.time += 0.1;
          return dent.time < 2;
        });
        
        this.perturbations = this.perturbations.filter(perturbation => {
          perturbation.time += 0.1;
          return perturbation.time < 1.5;
        });
        
        // Add random perturbations
        if (Math.random() < 0.02) {
          this.addRandomPerturbation();
        }
        
        // Update stats
        this.updateStats();
        
        // Render
        this.renderer.render(this.scene, this.camera);
      }
    }

    const waterDroplet = new WaterDroplet();

    const handleResize = () => {
      if (!containerRef.current) return;
      const size = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight);
      waterDroplet.renderer.setSize(size, size);
      waterDroplet.camera.aspect = 1;
      waterDroplet.camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Remove event listeners
      waterDroplet.renderer.domElement.removeEventListener('click', waterDroplet.onMouseClick);
      waterDroplet.renderer.domElement.removeEventListener('mousedown', waterDroplet.onMouseDown);
      waterDroplet.renderer.domElement.removeEventListener('mousemove', waterDroplet.onMouseMove);
      waterDroplet.renderer.domElement.removeEventListener('mouseup', waterDroplet.onMouseUp);
      
      // Dispose of Three.js resources
      waterDroplet.geometry.dispose();
      waterDroplet.material.dispose();
      waterDroplet.renderer.dispose();
    };
  }, []);

  return (
    <div className="home-module">
      <div className="generative-art" ref={containerRef}></div>
    </div>
  )
}