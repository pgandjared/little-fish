//日志管理器

package logger

import (
	"os"

	"go.uber.org/zap"
)
import "go.uber.org/zap/zapcore"

func InitLogger() {
	//配置编码器
	encoderconfig := zap.NewDevelopmentEncoderConfig()
	//时间，大写配置
	encoderconfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderconfig.EncodeLevel = zapcore.CapitalLevelEncoder
	//core配置,打印在控制台
	core := zapcore.NewCore(zapcore.NewJSONEncoder(encoderconfig), os.Stdout, zapcore.DebugLevel)
	//logger
	//zap.AddCaller()打印日志行号和文件名
	logger := zap.New(core, zap.AddCaller())
	//替换保存为全局日志
	zap.ReplaceGlobals(logger)
}
