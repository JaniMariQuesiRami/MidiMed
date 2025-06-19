import { auth, db } from '@/lib/firebase'
import {
	createUserWithEmailAndPassword,
	updateProfile,
} from 'firebase/auth'
import {
	doc,
	setDoc,
	runTransaction,
	serverTimestamp,
} from 'firebase/firestore'
import { Tenant, User } from '@/types/db'

export async function signUp({
	email,
	password,
	displayName,
	tenantName,
	phone,
	address,
}: {
	email: string
	password: string
	displayName: string
	tenantName: string
	phone: string
	address: string
}) {
	const userCredential = await createUserWithEmailAndPassword(auth, email, password)
	const user = userCredential.user
	await updateProfile(user, { displayName })

	const uid = user.uid
	const randomId = Math.floor(10000 + Math.random() * 90000)
	const tenantId = `${slugify(tenantName)}-${randomId}`
	const now = new Date().toISOString()

	const tenantData: Tenant = {
		tenantId,
		name: tenantName,
		createdAt: now,
		email,
		phone,
		address,
		settings: {
			appointmentDurationMinutes: 30,
			workingHours: {
				mon: ['08:00', '17:00'],
				tue: ['08:00', '17:00'],
				wed: ['08:00', '17:00'],
				thu: ['08:00', '17:00'],
				fri: ['08:00', '15:00'],
			},
		},
		counters: {
			patients: 0,
			appointments: 0,
			medicalRecords: 0,
		},
	}

	const userData: User = {
		tenantId,
		uid,
		email,
		displayName,
		role: 'admin',
		createdAt: now,
		lastLoginAt: now,
	}

	await runTransaction(db, async (tx) => {
		tx.set(doc(db, 'tenants', tenantId), tenantData)
		tx.set(doc(db, 'users', uid), userData)
	})

	return { user, tenantId }
}

const slugify = (str: string) =>
	str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
