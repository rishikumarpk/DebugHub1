'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const countRef = useRef<number>(0);
	const animationIdRef = useRef<number>(0);

	useEffect(() => {
		if (!containerRef.current) return;

		const SEPARATION = 120;
		const AMOUNTX = 120;
		const AMOUNTY = 120;

		const width = containerRef.current.clientWidth;
		const height = containerRef.current.clientHeight;

		// Scene setup
		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x000000, 0.001); // Adds seamless fade out

		const camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
		camera.position.set(0, 150, 400); // Lower and closer to emulate infinite flat space
		camera.lookAt(0, -100, -200);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
		renderer.setClearColor(0x000000, 0);

		const domElement = renderer.domElement;
		domElement.style.position = 'absolute';
		domElement.style.top = '0';
		domElement.style.left = '0';
		domElement.style.width = '100%';
		domElement.style.height = '100%';

		containerRef.current.appendChild(domElement);

		// Create particles
		const positions: number[] = [];
		const colors: number[] = [];

		const geometry = new THREE.BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0;
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);

				// Particle color: white always
				colors.push(1, 1, 1);
			}
		}

		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 2.5, // slightly smaller points
			vertexColors: true,
			transparent: true,
			opacity: 0.9,
			sizeAttenuation: true, // required by prompt
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		// Animation function
		const animate = () => {
			animationIdRef.current = requestAnimationFrame(animate);

			const positionAttribute = geometry.attributes.position;
			const positionsArray = positionAttribute.array as Float32Array;

			countRef.current += 0.03; // Smoother, slightly slower animation

			let i = 0;
			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const index = i * 3;

					positionsArray[index + 1] =
						Math.sin((ix + countRef.current) * 0.3) * 60 +
						Math.sin((iy + countRef.current) * 0.5) * 60;

					i++;
				}
			}

			positionAttribute.needsUpdate = true;
			renderer.render(scene, camera);
		};

		// Handle window resize
		const handleResize = () => {
			if (!containerRef.current) return;
			const newWidth = containerRef.current.clientWidth;
			const newHeight = containerRef.current.clientHeight;

			camera.aspect = newWidth / newHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(newWidth, newHeight);
		};

		window.addEventListener('resize', handleResize);

		// Start animation
		animate();

		// Cleanup function
		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationIdRef.current);

			geometry.dispose();
			material.dispose();
			renderer.dispose();

			if (domElement.parentNode) {
				domElement.parentNode.removeChild(domElement);
			}
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn('relative w-full h-full overflow-hidden', className)}
			{...props}
		/>
	);
}
