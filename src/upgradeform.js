export default function UpgradeForm({ $app, initialState, onClick, onSubmit }) {
    this.state = initialState;
    this.$target = document.createElement("form");
    this.$target.className = "upgrade";
    $app.appendChild(this.$target);
    this.onClick = onClick;
    this.onSubmit = onSubmit;

    this.setState = function (nextState) {
        this.state = nextState;
        // 새로 시작해야 할 때
        if (this.state.currentResult === null) this.render();

        this.update();
    }

    // this.render = function () {
    //     this.$target.innerHTML = `
    //     <input type="checkbox" id="nocatchOption">스타캐치 해제
    //         ${(this.state.currentStar >= 12 && this.state.currentStar < 17) ? '<input type="checkbox" id="preventOption">파괴방지' : ''}
    //         <input type="submit" value="강화">`;

    //     // 초기 설정 완료 시에만 보임
    //     this.$target.style.display = (this.state.ready) ? 'block' : 'none';
    // }

    this.render = function () {
        this.$target.innerHTML = `<input type="checkbox" id="nocatchOption">스타캐치 해제
        <input type="checkbox" id="preventOption">파괴방지
        <input type="submit" value="강화">
        <br>
        <input type="checkbox" id="alertOption">5배수 달성마다 알림창 띄우기`;

        this.$target.style.display = (this.state.ready) ? 'block' : 'none';
    }

    this.update = function () {
        // 초기 설정 완료한 경우, 내용물을 보여준다
        this.$target.style.display = (this.state.ready) ? 'block' : 'none';
        // 파괴방지 불가 구간에서는 파괴방지 버튼 비활성화
        if (this.state.currentStar < 12 || this.state.currentStar >= 17) {
            document.getElementById("preventOption").disabled = true;
        }
        else document.getElementById("preventOption").disabled = false;
    }


    // 파괴방지 버튼 체크/체크 해제 시
    this.$target.addEventListener("click", (e) => {
        const certainBox = e.target.closest('#preventOption');
        if (certainBox) {
            this.onClick(certainBox);
        }
    })

    // 강화 시
    this.$target.addEventListener("submit", (e) => {
        e.preventDefault();
        if (this.state.currentStar >= this.state.limit) {
            alert(`이미 최고 강화 단계인 ${this.state.limit}성에 도달하셨습니다!`);
            return;
        }
        this.onSubmit();
    })

    // 맨 처음에 먼저 렌더링해준다
    this.render();
}