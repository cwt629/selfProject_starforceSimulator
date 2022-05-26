import UpgradeForm from "./upgradeform.js";
import ResultTab from "./resulttab.js";
import CurrentData from "./currentdata.js";
import Star from "./star.js";
import Infos from "./infos.js";
import UpgradeInfo from "./upgradeInfo.js";

/* 
남은 과제:

아래는 할까말까:
- Modal 창을 띄워, 시뮬레이터에 대한 전반적인 설명을 띄워준다
*/

export default function App($app) {
    this.state = {
        // 초기 설정 완료 여부
        ready: false,
        // 각 단계별 성공확률
        successPercent: [],
        // 각 단계별 실패(파괴되지 않음)확률
        failurePercent: [],
        // 각 단계별 파괴확률
        destroyPercent: [],
        // 각 단계별 강화비용
        costs: [],
        // 강화에 실패해도 유지되는 단계들
        canKeep: [],
        // 이전 두번에 등급이 하락했는지 여부(찬스타임 구현을 위함)
        fallen: [],
        isChance: false,
        // 현재까지 쌓인 정보들
        level: null,
        total: {
            spent: 0n,
            success: 0,
            failure: 0,
            destroyed: 0
        },
        // 현재 강화 단계
        currentStar: null,
        // 파괴방지
        prevention: false,
        // 이번 강화의 결과
        currentResult: null,
        // 목표 단계 및 달성 여부(이미 달성하고도 더 강화를 시도할 경우 대비)
        goal: null,
        achieved: false
    }

    // 결과창 컴포넌트 생성
    const resultTab = new ResultTab({
        $app,
        initialState: {
            ready: this.state.ready,
            currentResult: this.state.currentResult
        }
    });

    // 현재 데이터 컴포넌트 생성
    const currentData = new CurrentData({
        $app,
        initialState: {
            ready: this.state.ready,
            level: this.state.level,
            total: this.state.total
        }
    });

    // 별 그림 컴포넌트 생성
    const star = new Star({
        $app,
        initialState: {
            ready: this.state.ready,
            currentStar: this.state.currentStar
        }
    });

    // 강화 정보 컴포넌트 생성
    const infos = new Infos({
        $app,
        initialState: {
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            canKeep: this.state.canKeep,
            costs: this.state.costs,
            successPercent: this.state.successPercent,
            failurePercent: this.state.failurePercent,
            destroyPercent: this.state.destroyPercent,
            fallen: this.state.fallen,
            prevention: this.state.prevention
        }
    });

    // 강화 탭 컴포넌트 생성
    const upgradeForm = new UpgradeForm({
        $app,
        initialState: {
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            fallen: this.state.fallen,
            currentResult: this.state.currentResult
        },
        // 파괴방지 버튼을 누를 시 발생하는 이벤트 함수
        onClick: (box) => {
            // 체크가 되면 강화비용을 2배로
            if (box.checked) {
                infos.setState({
                    ...this.state,
                    prevention: true
                });
                // 체크박스까지 다시 그려지지 않도록 따로 스테이트 설정
                this.state.prevention = true;
            }
            else {
                infos.setState({
                    ...this.state,
                    prevention: false
                });
                this.state.prevention = false;
            }

        },
        // 강화 버튼 누를 시 발생하는 이벤트 함수
        onSubmit: () => {
            // 찬스타임 시에는 무조건 성공
            if (this.state.fallen[0] === true && this.state.fallen[1] === true) {
                this.setState({
                    ...this.state,
                    total: {
                        ...this.state.total,
                        spent: this.state.total.spent + this.state.costs[this.state.currentStar],
                        success: this.state.total.success + 1
                    },
                    fallen: [false, false],
                    currentStar: this.state.currentStar + 1,
                    currentResult: "success"
                });
                return;
            }
            // 스타캐치 해제 및 파괴방지 체크 확인
            const nocatch = document.getElementById("nocatchOption").checked;
            var preventApplied = false;
            // 파괴방지 시 비용 2배 증가
            var preventPenalty = 1n;
            if (this.state.currentStar >= 12 && this.state.currentStar < 17) {
                if (this.state.prevention) {
                    preventPenalty = 2n;
                    preventApplied = true;
                }
            }

            // 강화 결과에 따라 작업 수행
            switch (upgradeResult(this.state.successPercent[this.state.currentStar],
                this.state.destroyPercent[this.state.currentStar],
                nocatch, preventApplied)) {
                case "success":
                    this.setState({
                        ...this.state,
                        total: {
                            ...this.state.total,
                            spent: this.state.total.spent + this.state.costs[this.state.currentStar] * preventPenalty,
                            success: this.state.total.success + 1
                        },
                        fallen: [this.state.fallen[1], false],
                        currentStar: this.state.currentStar + 1,
                        currentResult: "success",
                    });
                    break;

                case "failure":
                    var nextstar = this.state.currentStar;
                    // 찬스타임 구현을 위해, 하락과 유지를 구분한다
                    var fell;
                    if (this.state.canKeep.includes(this.state.currentStar)) {
                        fell = false;
                    } else {
                        fell = true;
                        nextstar--;
                    }
                    this.setState({
                        ...this.state,
                        total: {
                            ...this.state.total,
                            spent: this.state.total.spent + this.state.costs[this.state.currentStar] * preventPenalty,
                            failure: this.state.total.failure + 1
                        },
                        fallen: [this.state.fallen[1], fell],
                        currentStar: nextstar,
                        currentResult: "failure",
                    });
                    break;

                case "destroyed":
                    alert("장비가 파괴되었습니다.");
                    this.setState({
                        ...this.state,
                        total: {
                            ...this.state.total,
                            spent: this.state.total.spent + this.state.costs[this.state.currentStar],
                            destroyed: this.state.total.destroyed + 1
                        },
                        fallen: [false, false],
                        currentStar: 12,
                        currentResult: "destroyed",
                    });
                    break;
            }
            // 강화 후, 목표에 처음으로 도달한 경우
            if (!this.state.achieved && this.state.currentStar === this.state.goal) {
                const achievedMessage = `목표 단계인 ${this.state.goal}성에 도달하였습니다!\n총 소비 메소: ${this.state.total.spent.toLocaleString()} 메소${(this.state.total.destroyed > 0) ? ` + 해당 아이템 ${this.state.total.destroyed}개` : ''}`;
                alert(achievedMessage);
                this.state.achieved = true;
            }
        }
    });

    // setstate 함수
    this.setState = function (nextState) {
        this.state = nextState;
        resultTab.setState({
            ready: this.state.ready,
            currentResult: this.state.currentResult
        });
        currentData.setState({
            ready: this.state.ready,
            level: this.state.level,
            total: this.state.total
        });
        star.setState({
            ready: this.state.ready,
            currentStar: this.state.currentStar
        });
        infos.setState({
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            canKeep: this.state.canKeep,
            costs: this.state.costs,
            successPercent: this.state.successPercent,
            failurePercent: this.state.failurePercent,
            destroyPercent: this.state.destroyPercent,
            fallen: this.state.fallen,
            prevention: this.state.prevention
        });
        upgradeForm.setState({
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            fallen: this.state.fallen,
            currentResult: this.state.currentResult
        });
    }

    // 특정 확률로 강화했을 때 결과를 반환하는 함수(난수 이용)
    const upgradeResult = function (successPercent, destroyPercent, nocatch, prevent) {
        const random = Math.random() * 100;
        // 파괴 방지
        if (prevent) {
            destroyPercent = 0;
        }
        // 스타캐치 시
        if (!nocatch) {
            destroyPercent = destroyPercent * (100 - successPercent * 1.05) / (100 - successPercent);
            successPercent *= 1.05;
        }
        // 성공
        if (random < successPercent) return "success";
        // 파괴
        else if (random > 100 - destroyPercent) return "destroyed";
        // 일반 실패
        return "failure";
    }

    // 초기 스테이트 설정
    const upgradeInfo = new UpgradeInfo();
    this.setState({
        ...this.state,
        successPercent: upgradeInfo.success,
        failurePercent: upgradeInfo.failure,
        destroyPercent: upgradeInfo.destroyed,
        canKeep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20],
        fallen: [false, false]
    });

    // 설정 완료 시
    const initialSetting = document.querySelector(".inputs");
    initialSetting.addEventListener("submit", (e) => {
        e.preventDefault();
        // 목표가 더 낮은 경우는 다시 설정해야 함
        if (initialSetting.goal.value <= initialSetting.begin.value) {
            alert("목표 단계가 시작 단계보다 더 높아야 합니다!");
            return;
        }
        // 이미 설정이 완료된 상태에서는 confirm받기
        if (this.state.ready) {
            if (!confirm("설정을 바꾸면 모든 강화가 초기화됩니다. 계속하시겠습니까?")) return;
        }
        // 장비레벨과 시작 별 받아오기
        this.setState({
            ...this.state,
            ready: true,
            level: initialSetting.level.value,
            currentStar: parseInt(initialSetting.begin.value),
            costs: upgradeInfo.costs[initialSetting.level.value],
            fallen: [false, false],
            total: {
                spent: 0n,
                success: 0,
                failure: 0,
                destroyed: 0
            },
            currentResult: null,
            prevention: false,
            goal: parseInt(initialSetting.goal.value),
            achieved: false
        });
    })
}