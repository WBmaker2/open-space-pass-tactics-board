import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

/** 기술 스택이나 원시 오류를 노출하지 않고 어린이용 문장과 다시 하기만 제공한다. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch() {
    // 외부 전송 없음. 학생 화면에 오류 내용을 보여 주지 않는다.
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <h1>활동을 다시 불러오지 못했어요.</h1>
          <p>처음부터 다시 시작할 수 있어요.</p>
          <button type="button" onClick={() => window.location.reload()}>
            처음부터 다시 하기
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
