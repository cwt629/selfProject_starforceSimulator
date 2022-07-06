export default function ResultTab({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement("div");
    this.$target.className = "result";
    $app.appendChild(this.$target);

    this.setState = function (nextState) {
        this.state = nextState;
        this.render();
    }

    this.render = function () {
        const resultShow = {
            success: { message: "강화 성공!", color: "green", back: "gainsboro" },
            failure: { message: "강화 실패", color: "red", back: "gainsboro" },
            destroyed: { message: "장비 파괴..!!", color: "white", back: "black" }
        };

        this.$target.innerHTML = (this.state.currentResult in resultShow) ? resultShow[this.state.currentResult].message : "이 부분에 강화 결과가 출력됩니다.";
        if (this.state.currentResult in resultShow) {
            this.$target.style.color = resultShow[this.state.currentResult].color;
            this.$target.style.backgroundColor = resultShow[this.state.currentResult].back;
        }
        else {
            this.$target.style.color = "black";
            this.$target.style.backgroundColor = "gainsboro";
        }
        // 초기 설정을 완료한 경우에만 보여준다
        this.$target.style.display = (this.state.ready) ? 'block' : 'none';
    }
}