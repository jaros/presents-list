const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');

exports.shareList = functions.database.ref('/TODO_ITEMS_META_LIST/{owner}/links/{listId}/sharing')
  .onWrite(async (snapshot, context) => {
    const dataBefore = snapshot.before.val();
    const dataAfter = snapshot.after.val();
    console.log('dataBefore', dataBefore, 'dataAfter', dataAfter);

    const { owner, listId } = context.params;

    console.log('new sharing for', listId, 'by', owner);

    const fbConf = config.firebaseConfig;
    const appOptions = fbConf;
    appOptions.databaseAuthVariableOverride = context.auth;

    const app = admin.initializeApp(appOptions, 'app');
    const deleteApp = () => app.delete().catch(() => null);

    if (dataBefore) {
      // TODO remove previous sharing - only one peer per time
    }

    const labelSnap = await app.database().ref('TODO_ITEMS_META_LIST/' + owner + '/links/' + listId + '/label').once('value');

    const label = labelSnap.val();

    console.log('sharing', listId, label);


    try {
      const userRecord = await app.auth().getUserByEmail(dataAfter);
      const uid = userRecord.uid;

      await app.database().ref('TODO_ITEMS_META_LIST/' + uid + '/links/' + listId).set({
        id: listId,
        label: label,
        owner: owner,
        readonly: true
      });
      return deleteApp();
    } catch (err) {
      console.log('user not found', dataAfter, err);
      return deleteApp();
    }
  });
