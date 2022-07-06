export default function CurrentData({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement("div");
    this.$target.className = "currentData";
    $app.appendChild(this.$target);

    this.setState = function (nextState) {
        this.state = nextState;
        this.render();
    }

    this.render = function () {
        this.$target.innerHTML = `
        <div class="level">장비 레벨: ${this.state.init.level}</div>
        <div id="objective" class="target">설정 목표: ${this.state.init.start}성 > ${this.state.init.goal}성</div>
        <div class="costs">장비 복구 비용: ${(this.state.init.equipCost !== null) ? `${this.state.init.equipCost.toLocaleString()}메소` : "미설정"}</div>
        <div class="total">총 사용 메소: ${this.state.total.spent.toLocaleString()} 메소</div>
        <div class="intermediate">
            <div class="inter_success">성공 횟수: ${this.state.total.success}회</div>
            <div class="inter_failure">실패 횟수: ${this.state.total.failure}회</div>
            <div class="inter_destroyed">파괴 횟수: ${this.state.total.destroyed}회</div>
        </div>
        `;
        // 초기 설정을 완료한 경우에만 보여준다
        this.$target.style.display = (this.state.ready) ? 'block' : 'none';
        // 달성 완료 시
        if (this.state.achieved)
            document.getElementById("objective").classList.add("achieved");
    }
}