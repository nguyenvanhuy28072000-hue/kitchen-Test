let latestSnapshot = null;

let courseData = {};
let courseDuration = {};

function loadCourses(){

    const user =
    firebase.auth().currentUser;


    return window.db
    .collection("users")
    .doc(user.uid)
    .get()

    .then(userDoc=>{


        const shopId =
        userDoc.data().shopId;


        return window.db
        .collection("shops")
        .doc(shopId)
        .collection("courses")
        .get();

    })

    .then(snapshot=>{

        courseData = {};
        courseDuration = {};

        const select =
        document.getElementById("courseSelect");

        select.innerHTML =
        '<option value="">コース選択</option>';

        snapshot.forEach(doc=>{

            const data = doc.data();

            courseData[doc.id] = data.dishes;
            courseDuration[doc.id] = data.duration;

            select.innerHTML += `
                <option value="${doc.id}">
                    ${doc.id}
                </option>
            `;

        });

    });

}

//③ コース追加
//「追加」ボタンを押した時の処理。
function addCourse() {
  //開始時間取得。
  const time = document.getElementById("courseTime").value;
  //コース取得。
  const course = document.getElementById("courseSelect").value;
  //人数取得。
  const people = document.getElementById("people").value;
  //卓番号取得。
  const table = document.getElementById("tableNo").value;

  //未入力チェック
  if (!time || !course || !people || !table) {
    alert("未入力があります");  //どれか空なら表示
    return;
  }

//注文データ作成。
    const user = firebase.auth().currentUser;
    const shopId = "kyoto001";
    window.db.collection("orders").add({
    //基本情報
    userId: user.uid,
    shopId: shopId,
    time,
    course,
    people: Number(people),
    table,
  
  //料理一覧生成。
    dishes: (courseData[course] || []).map(d => ({
      name: d,
      done: false, //未提供状態。
    })),
  
    extraDishes: [],  //追加料理用。
  
    createdAt: Date.now() //登録時刻保存。
    });

    document.getElementById("people").value = "";
    document.getElementById("tableNo").value = "";
}

//⑤ 注文表示
//画面表示担当。
function renderOrders(snapshot) {
  const body = document.getElementById("courseBody");
  body.innerHTML =　"";

let startedHtml = "";
let waitingHtml = "";
  
  snapshot.docs
  
  //並び替え
  .sort((a,b)=>{
  const timeCompare =
    a.data().time.localeCompare(b.data().time);  //時間順

  if(timeCompare !== 0) return timeCompare;

  //同じ時間なら
  return (a.data().createdAt || 0) -
         (b.data().createdAt || 0);
})

//⑥ラストオーダー計算
.forEach(doc=>{
    const order = doc.data();
    const id = doc.id;
let courseOptions = "";

Object.keys(courseData).forEach(course=>{

    courseOptions += `
    <option value="${course}"
    ${order.course===course?"selected":""}>
        ${course}
    </option>
    `;

});
    const [h, m] = order.time.split(":");  //開始時刻分解。h=hour,m=minues

    const lo = new Date(); //日時作成。
    lo.setHours(Number(h));
    lo.setMinutes(Number(m) + courseDuration[order.course]); //コース時間加算。

    let loText =
      lo.getHours().toString().padStart(2,"0") +
      ":" +
      lo.getMinutes().toString().padStart(2,"0");

const now = new Date();

//⑦ 残り時間計算
// 残り時間計算(L.Oまで何分か。)
const remainMinutes =
  Math.floor((lo.getTime() - now.getTime()) / 60000);

//⑧進捗バー計算
//開始時刻。
const startMinutes =
  Number(h) * 60 + Number(m);

//現在時刻。
const nowMinutes =
  now.getHours() * 60 +
  now.getMinutes();

//コース時間。
const duration =
  courseDuration[order.course];
const totalCols =
  order.dishes.length +
  ((order.extraDishes && order.extraDishes.length) || 0);

//進捗率。
let progress =
  ((nowMinutes - startMinutes) / duration) * 100;

if(progress < 0) progress = 0;
if(progress > 100) progress = 100;

const colors = [
    "#eeeeee",
    "#d6ecff",
    "#dff7df",
    "#fff7c7",
    "#ffe4c4",
    "#ffd6d6",
    "#e8d6ff",
    "#d6fff7",
    "#ffe8b3",
    "#d9f0ff"
];

const courseNames = Object.keys(courseData);

const colorIndex =
courseNames.indexOf(order.course) % colors.length;

const rowColor = colors[colorIndex];

let loClass = "";
let progressClass = "";

//⑩ 色変更
//L.O超過。
if(remainMinutes < 0){

  loClass = "loRed";
  loText = "L.O.過ぎ";

  progressClass = "progressRed";

}
else if(remainMinutes <= 10){

  loClass = "loRed"; 
  progressClass = "progressRed";  //バー赤。

}
else if(remainMinutes <= 30){

  loClass = "loYellow";
  progressClass = "progressYellow"; //黄色。

}

    let html = `
      <tr style="background:${rowColor}">

        <td>
          <button onclick="addExtraDish('${id}')">
            ＋料理
          </button>
        </td>
        
        <td>
          <button onclick="deleteOrder('${id}')">
            削除
          </button>
        </td>

        <td>
          <input type="time"
            value="${order.time}"
            onchange="updateField('${id}','time',this.value)">
        </td>

        <td>
          <select onchange="updateCourse('${id}',this.value)">
            ${courseOptions}
            </select>
        </td>

        <td>
          <input type="number"
            value="${order.people}"
            onchange="updateField('${id}','people',this.value)"
            style="width:50px;">
          名
        </td>

        <td>
          <input type="text"
            value="${order.table}"
            onchange="updateField('${id}','table',this.value)">
        </td>

        <td
  id="lo-${id}"
  class="${loClass}">
  ${loText}
</td>
    `;

//⑪ 料理表示
    //料理を1セルずつ作成
    order.dishes.forEach((dish, i) => {
      html += `
      
        <td
            class="dish dish${i} ${dish.done ? "done" : ""}"
            draggable="true"
            ondragstart="dragDish('${id}',${i})"
            ondragover="event.preventDefault()"
            ondrop="dropDish('${id}',${i})"
            onclick="toggleDish('${id}',${i})"
          >
            ${dish.name}
        </td>
      `;
    });
    
//⑫ 追加料理表示
if(order.extraDishes){

  order.extraDishes.forEach((dish,i)=>{

    html += `
      <td
        class="dish extraDish ${dish.done ? 'done' : ''}"
      
        draggable="true"
      
        ondragstart="dragExtraDish('${id}',${i})"
      
        ondragover="event.preventDefault()"
      
        ondrop="dropExtraDish('${id}',${i})"
      
        onclick="toggleExtraDish('${id}',${i})"
      >
        ★${dish.name}
      </td>
    `;

  });

}

    html += `
</tr>


<tr style="background:${rowColor}">
  <td colspan="7"></td>

  <td colspan="${totalCols}">
    <div class="progressWrap">
      <div
        id="progress-${id}"
        class="progressBar ${progressClass}"
        style="width:${progress}%">
      </div>
    </div>
  </td>

</tr>
`;

    const started =
  nowMinutes >= startMinutes;

  if(started){
    startedHtml += html;
  }else{
    waitingHtml += html;
  }
  });
  body.innerHTML =

`<tr>
   <td colspan="20" class="sectionTitle">
     進行中コース
   </td>
 </tr>`

+ startedHtml +

`<tr>
   <td colspan="20" class="sectionTitle">
     開始前コース
   </td>
 </tr>`

+ waitingHtml;
}

//⑭ 更新処理
   function updateField(orderId, field, value) {
  const ref = window.db.collection("orders").doc(orderId);

  ref.update({
    [field]: field === "people" ? Number(value) : value
  });
}


//⑮ 完了済み表示
function renderCompleted(snapshot) {
  const body = document.getElementById("completedBody");
  body.innerHTML = "";

  snapshot.docs
.sort((a,b)=>
 (a.data().sortOrder || 0) -
 (b.data().sortOrder || 0)
)
.forEach(doc=>{
    const d = doc.data();

if(
  d.completedAt &&
  Date.now() - d.completedAt >
  60 * 60 * 1000
){
  window.db
    .collection("completedOrders")
    .doc(doc.id)
    .delete();

  return;
}

    body.innerHTML += `
      <tr>
        <td>${d.time}</td>
        <td>${d.course}</td>
        <td>${d.people}</td>
        <td>${d.table}</td>
        <td>${d.completedTime || ""}</td>
        <td>
          <button onclick="restoreOrder('${doc.id}')">戻す</button>
        </td>
      </tr>
    `;
  });
}

//⑰ 提供済み切替
//料理タップ時。
function toggleDish(orderId, index) {
  const ref = window.db.collection("orders").doc(orderId);

  ref.get().then(doc => {
    const data = doc.data();

    const extra = data.extraDishes || [];
    
    data.dishes[index].done = !data.dishes[index].done;

    const allDone =

    data.dishes.every(function(d){

        return d.done;

    }) &&

    (

        extra.length === 0 ||

        extra.every(function(d){

            return d.done;

        })

    );

//全部完了したら「conpleteOrder」に移動
    if (allDone) {
      window.db.collection("completedOrders").add({
        ...data,
        completedTime: new Date().toLocaleTimeString("ja-JP"),
        completedAt: Date.now()
      });

      ref.delete();
    } else {
      ref.update({ dishes: data.dishes });
    }
  });
}

function toggleExtraDish(orderId,index){

    const ref =
    window.db.collection("orders").doc(orderId);

    ref.get().then(function(doc){

        const data = doc.data();

        const extra = data.extraDishes || [];

        // 提供状態切替
        extra[index].done =
        !extra[index].done;

        // 全部提供済み？
        const allDone =
        data.dishes.every(function(d){
            return d.done;
        }) &&
        extra.every(function(d){
            return d.done;
        });

        if(allDone){

            window.db.collection("completedOrders").add({
                userId:data.userId,
                time:data.time,
                course:data.course,
                people:data.people,
                table:data.table,
                dishes:data.dishes,
                extraDishes:extra,
                createdAt:data.createdAt,

                completedTime:
                new Date().toLocaleTimeString("ja-JP"),

                completedAt:
                Date.now()

            });

            ref.delete();

        }else{

            ref.update({

                extraDishes:extra

            });

        }

    });

}

//⑱ 削除
function deleteOrder(id) {
  if (confirm("削除しますか？")) {
    window.db.collection("orders").doc(id).delete();
  }
}

//⑲ 戻す
function restoreOrder(id) {
  window.db.collection("completedOrders").doc(id).get()
    .then(doc => {
      const data = doc.data();

      delete data.completedTime;
      delete data.completedAt;
      
      window.db.collection("orders").add(data);

      window.db.collection("completedOrders").doc(id).delete();
    });
}

//⑳ 追加料理
function addExtraDish(orderId){

  const choice = prompt(
`追加料理を選択(番号を入力してください)

0: 追加料理を削除
1: 焼き鳥
2: 宮炭`
  );

  const ref =
    window.db.collection("orders").doc(orderId);

  ref.get().then(doc=>{

    const data = doc.data();

    let extra =
      data.extraDishes || [];

    // 0なら最後の追加料理を削除
    if(choice === "0"){

      if(extra.length === 0){
        alert("追加料理がありません");
        return;
      }

      extra.pop();

      ref.update({
        extraDishes: extra
      });

      return;
    }

    let name = "";

    if(choice === "1") name = "焼き鳥";
    if(choice === "2") name = "宮炭";

    if(!name) return;

    extra.push({
      name:name,
      done:false
    });

    ref.update({
      extraDishes: extra
    });

  });

}

//㉑ コース変更
function updateCourse(orderId, newCourse) {

  window.db.collection("orders")
.doc(orderId)
.update({

    course:newCourse,

    dishes: (courseData[newCourse] || []).map(d => ({
        name:d,
        done:false
    })),

    extraDishes:[]

});

}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}
let dragOrderId = null;
let dragIndex = null;

function dragDish(orderId, index) {
    dragOrderId = orderId;
    dragIndex = index;
}

function dropDish(orderId, dropIndex) {

    if (dragOrderId !== orderId) return;
    if (dragIndex === null) return;

    const ref = window.db.collection("orders").doc(orderId);

    ref.get().then(doc => {

        const data = doc.data();

        const dishes = data.dishes;

        const item = dishes.splice(dragIndex,1)[0];

        dishes.splice(dropIndex,0,item);

        ref.update({
            dishes:dishes
        });

        dragIndex = null;
        dragOrderId = null;

    });

}

let dragExtraIndex = null;
let dragExtraOrderId = null;

function dragExtraDish(orderId,index){

    dragExtraOrderId = orderId;
    dragExtraIndex = index;

}

function dropExtraDish(orderId,dropIndex){

    if(dragExtraOrderId !== orderId) return;

    const ref = window.db.collection("orders").doc(orderId);

    ref.get().then(doc=>{

        const data = doc.data();

        const extra = data.extraDishes || [];

        const item = extra.splice(dragExtraIndex,1)[0];

        extra.splice(dropIndex,0,item);

        ref.update({
            extraDishes:extra
        });

        dragExtraIndex = null;
        dragExtraOrderId = null;

    });

}

window.logout = logout;
window.addCourse = addCourse;
window.deleteOrder = deleteOrder;
window.updateField = updateField;
window.updateCourse = updateCourse;
window.toggleDish = toggleDish;
window.restoreOrder = restoreOrder;
window.toggleExtraDish = toggleExtraDish;
window.dragDish = dragDish;
window.dropDish = dropDish;
window.dragExtraDish = dragExtraDish;
window.dropExtraDish = dropExtraDish;


firebase.auth().onAuthStateChanged(user => {
    if (!user){
        window.location.href = "login.html";
        return;
    }
    loadCourses().then(()=>{
        const user = firebase.auth().currentUser;
        window.db.collection("orders")
        .where("userId","==",user.uid)
        .onSnapshot(snapshot=>{
            
            latestSnapshot = snapshot;
            renderOrders(snapshot);
        });
        window.db.collection("completedOrders")
        .where("userId","==",user.uid)
        .onSnapshot(snapshot=>{
           
             renderCompleted(snapshot);
        });
    });
});
//㉒ 1秒ごと更新
setInterval(() => {
    const user = firebase.auth().currentUser;
    
    if(!user) return;
    
    window.db.collection("orders")
    .where("userId","==",user.uid)
    .get()
    .then(snapshot => {

      snapshot.forEach(doc => {

        const order = doc.data();
        const id = doc.id;

        const [h,m] =
          order.time.split(":");

        const now = new Date();

        const startMinutes =
          Number(h) * 60 + Number(m);

        const nowMinutes =
          now.getHours() * 60 +
          now.getMinutes();

        const duration =
          courseDuration[order.course];

        let progress =
          ((nowMinutes - startMinutes)
          / duration) * 100;

        if(progress < 0) progress = 0;
        if(progress > 100) progress = 100;

        const bar =
          document.getElementById(
            `progress-${id}`
          );

        if(bar){
          bar.style.width =
            progress + "%";
        }

      });

    });

},1000);

setInterval(() => {
    
  if(latestSnapshot){
    renderOrders(latestSnapshot);
  }

}, 30000); // 30sごと