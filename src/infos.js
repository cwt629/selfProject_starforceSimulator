export default function Infos({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement("div");
    this.$target.className = "infos";
    $app.appendChild(this.$target);

    this.setState = function (nextState) {
        this.state = nextState;
        this.render();
    }

    this.render = function () {
        // 각 메세지를 배열에 담고, 그것들을 각각 p태그 안에 집어넣는 형식으로 한다
        const messages = [];
        // 찬스타임 여부 확인
        const isChance = (this.state.fallen[0] === true && this.state.fallen[1] === true);
        // 파괴방지 여부 관련
        const canPrevent = (this.state.currentStar >= 12 && this.state.currentStar < 17);
        const preventPenalty = (!isChance && canPrevent && this.state.prevention) ? 2n : 1n;
        // 강화단계
        if (this.state.ready) {
            if (this.state.currentStar >= 25) {
                messages.push("25성 달성에 성공하였습니다!");
            }
            else {
                messages.push(`${this.state.currentStar}성 > ${this.state.currentStar + 1}성`);
                // 강화비용
                messages.push(`강화비용: ${(this.state.costs[this.state.currentStar] * preventPenalty).toLocaleString()} 메소`);
                // 성공확률
                messages.push(`성공확률: ${(isChance) ? 100 : this.state.successPercent[this.state.currentStar]}%`);
                // 이하는 찬스타임일 경우는 보이지 않음
                if (!isChance) {
                    // 실패확률
                    messages.push(`실패(${(this.state.canKeep.includes(this.state.currentStar) ? "유지" : "하락")})확률: ${this.state.failurePercent[this.state.currentStar]}%`);
                    // 파괴확률
                    messages.push(`파괴확률: ${this.state.destroyPercent[this.state.currentStar]}%`);
                }
            }
        }

        // 각 메세지를 p태그에 집어넣는다
        this.$target.innerHTML = `${(isChance) ? '<p class="chance">CHANCE TIME!</p>' : ''}${messages.map((msg) => `<p>${msg}</p>`).join("")}`;
        // 초기 설정 완료 시에만 보인다
        this.$target.style.display = (this.state.ready) ? 'block' : 'none';
    }
}