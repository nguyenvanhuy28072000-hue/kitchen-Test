function login() {

  firebase.auth().signInWithEmailAndPassword(
    document.getElementById("email").value,
    document.getElementById("password").value
  )
  
  .then(() => {
    window.location.href = "index.html";
  })
  .catch(error => {

    switch (error.code) {

      case "auth/invalid-login-credentials":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
        alert("メールアドレスまたはパスワードが間違っています。");
        break;

      case "auth/invalid-email":
        alert("メールアドレスの形式が正しくありません。");
        break;

      case "auth/too-many-requests":
        alert("何度も失敗したため、一時的にログインできません。しばらく待ってからお試しください。");
        break;

      default:
        alert("ログインに失敗しました。\n" + error.message);
    }

  });

}