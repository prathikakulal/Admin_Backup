// backend/scripts/seed-admin.js
// Run once: node scripts/seed-admin.js
// Sets isAdmin:true in Firestore for your admin email.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const admin = require('firebase-admin')
const path = require('path')

const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json')
const serviceAccount = require(serviceAccountPath)

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

const db = admin.firestore()
const auth = admin.auth()

const ADMIN_EMAIL = process.argv[2] || 'karishmakotecha10@gmail.com'

async function seedAdmin() {
    console.log(`\n🔍  Looking up Firebase Auth user for: ${ADMIN_EMAIL}`)

    let userRecord
    try {
        userRecord = await auth.getUserByEmail(ADMIN_EMAIL)
        console.log(`✅  Found user UID: ${userRecord.uid}`)
    } catch (e) {
        console.error(`❌  User not found in Firebase Auth for email "${ADMIN_EMAIL}"`)
        console.error('    → Make sure you created the user in the Firebase Console first.')
        process.exit(1)
    }

    const uid = userRecord.uid
    const userRef = db.collection('users').doc(uid)
    const snap = await userRef.get()

    if (snap.exists) {
        console.log('📄  Existing Firestore doc:', snap.data())
        await userRef.update({ isAdmin: true })
        console.log('✅  Updated isAdmin: true')
    } else {
        await userRef.set({
            email: ADMIN_EMAIL,
            isAdmin: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        console.log('✅  Created new Firestore doc with isAdmin: true')
    }

    console.log('\n🎉  Done! You can now log in to the Admin panel.\n')
    process.exit(0)
}

seedAdmin().catch(e => {
    console.error('Fatal error:', e)
    process.exit(1)
})
