const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');


exports.shareList = functions.database.ref('/TODO_ITEMS_META_LIST/{owner}/links/{listId}/sharing')
  .onWrite(async (snapshot, context) => {
    const dataBefore = snapshot.before.val();
    const dataAfter = snapshot.after.val();
    const { owner, listId } = context.params;

    console.log('new sharing for', listId, 'by', owner);

    const fbConf = config.firebaseConfig;
    const appOptions = fbConf;
    appOptions.databaseAuthVariableOverride = context.auth;

    const app = admin.initializeApp(appOptions, 'app');
    const deleteApp = () => app.delete().catch(() => null);

    const labelSnap = await app.database().ref('TODO_ITEMS_META_LIST/' + owner + '/links/' + listId + '/label').once('value');

    const label = labelSnap.val();

    console.log('sharing', listId, label);


    try {
      const userRecord = await app.auth().getUserByEmail(dataAfter);
      const uid = userRecord.getUid();

      await app.database().ref('TODO_ITEMS_META_LIST/' + uid + '/links/' + listId).set({
        id: listId,
        label: label,
        owner: owner,
        readonly: true
      });
      return deleteApp();
    } catch (err) {
      console.log('user not found', dataAfter);
      return deleteApp();
    }

    //return snapshot.ref.parent.child('uppercase').set(uppercase);

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
  });