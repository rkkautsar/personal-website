import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const createUser = functions.auth.user().onCreate((user) => {
  return admin
    .firestore()
    .collection("users")
    .doc(user.uid)
    .set({
      uid: user.uid,
      displayName: user.displayName || `Anonymous (${user.uid})`,
      email: user.email,
      createdAt: user.metadata.creationTime,
    });
});

export const deleteUser = functions.auth.user().onDelete((user) => {
  return admin.firestore().collection("users").doc(user.uid).delete();
});

export const answerQuiz = functions.https.onCall(async (data, context) => {
  const { quizId, answer } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Need to be authenticated"
    );
  }

  const { uid } = context.auth;

  if (!quizId || !answer) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Need `quizId` and `answer`"
    );
  }

  const leaderboardRef = admin.firestore().collection("leaderboard");
  const [user, quiz, submission] = await Promise.all([
    admin.firestore().collection("users").doc(uid).get(),
    admin.firestore().collection("quizzes").doc(quizId).get(),
    admin
      .firestore()
      .collection(`users/${uid}/quizSubmissions`)
      .doc(quizId)
      .get(),
  ]);

  if (submission.exists || !quiz.exists) {
    throw new functions.https.HttpsError(
      "already-exists",
      "Already submitted or quiz does not exist"
    );
  }

  if (answer !== quiz.get("answer")) {
    throw new functions.https.HttpsError("invalid-argument", "Wrong answer");
  }

  const quizPoint = quiz.get("point");

  return Promise.all([
    submission.ref.create({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      quiz: quiz.ref,
    }),
    user.ref.update({
      points: admin.firestore.FieldValue.increment(quizPoint),
    }),
    leaderboardRef.doc(uid).set({
      user: user.ref,
      displayName: user.data()?.displayName,
      points: admin.firestore.FieldValue.increment(quizPoint),
    }),
  ]);
});
