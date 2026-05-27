import { useCarry } from "../context/CarryContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Clock, CheckCircle2, AlertCircle, Info } from "lucide-react";

export function ExecutionLog() {
  const { executionLog } = useCarry();

  const getLogIcon = (message: string) => {
    if (message.includes("완료") || message.includes("주무세요") || message.includes("냄새") || message.includes("쉬어가세요") || message.includes("다녀오세요")) {
      return <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-success)" }} />;
    }
    if (message.includes("조회") || message.includes("준비") || message.includes("이동")) {
      return <Info className="w-4 h-4" style={{ color: "var(--color-kitchen)" }} />;
    }
    if (message.includes("에러") || message.includes("실패")) {
      return <AlertCircle className="w-4 h-4" style={{ color: "var(--color-danger)" }} />;
    }
    return <Clock className="w-4 h-4" style={{ color: "var(--color-muted)" }} />;
  };

  const getLogVariant = (message: string): "default" | "success" | "info" | "warning" => {
    if (message.includes("완료") || message.includes("주무세요") || message.includes("냄새") || message.includes("쉬어가세요") || message.includes("다녀오세요")) {
      return "success";
    }
    if (message.includes("조회") || message.includes("준비") || message.includes("이동")) {
      return "info";
    }
    if (message.includes("에러") || message.includes("실패")) {
      return "warning";
    }
    return "default";
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-1" style={{ color: "var(--color-text)" }}>실행 로그</h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            CARRY의 실시간 실행 과정을 확인하세요
          </p>
        </div>

        {/* Log Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-line)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>전체 로그</p>
            <p className="text-2xl" style={{ color: "var(--color-text)" }}>{executionLog.length}</p>
          </Card>
          <Card className="p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-line)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>성공</p>
            <p className="text-2xl" style={{ color: "var(--color-success)" }}>
              {executionLog.filter((log) => log.message.includes("완료") || log.message.includes("주무세요") || log.message.includes("냄새") || log.message.includes("쉬어가세요") || log.message.includes("다녀오세요")).length}
            </p>
          </Card>
          <Card className="p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-line)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>진행 중</p>
            <p className="text-2xl" style={{ color: "var(--color-kitchen)" }}>
              {executionLog.filter((log) => log.message.includes("중")).length}
            </p>
          </Card>
          <Card className="p-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-line)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>오류</p>
            <p className="text-2xl" style={{ color: "var(--color-danger)" }}>
              {executionLog.filter((log) => log.message.includes("에러") || log.message.includes("실패")).length}
            </p>
          </Card>
        </div>

        {/* Log List */}
        <Card style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-line)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--color-line)" }}>
            <h3 style={{ color: "var(--color-text)" }}>실시간 로그</h3>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-2">
              {executionLog.map((log, index) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 rounded-lg transition-colors hover:opacity-80"
                  style={{
                    backgroundColor:
                      index === 0
                        ? "var(--color-surface-soft)"
                        : "transparent",
                  }}
                >
                  <div className="shrink-0 mt-0.5">{getLogIcon(log.message)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                        {log.time}
                      </span>
                      {index === 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: "var(--color-success)",
                            color: "var(--color-success)",
                          }}
                        >
                          최신
                        </Badge>
                      )}
                    </div>
                    <p style={{ color: "var(--color-text)" }}>{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Empty State */}
        {executionLog.length === 0 && (
          <Card
            className="p-12"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-line)" }}
          >
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-muted)" }} />
              <p className="mb-2" style={{ color: "var(--color-text)" }}>아직 실행 로그가 없습니다</p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                CARRY를 호출하면 로그가 표시됩니다
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
