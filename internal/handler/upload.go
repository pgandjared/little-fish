package handler

import (
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// UploadImage 处理图片上传，保存到本地 uploads 目录并返回可访问的 URL
func UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "请选择要上传的图片"})
		return
	}

	// 限制文件大小 10MB
	if file.Size > 10<<20 {
		c.JSON(400, gin.H{"error": "图片大小不能超过10MB"})
		return
	}

	// 验证文件类型
	ext := filepath.Ext(file.Filename)
	allowedExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
	}
	if !allowedExts[ext] {
		c.JSON(400, gin.H{"error": "仅支持 jpg/jpeg/png/gif/webp 格式的图片"})
		return
	}

	// 确保 uploads 目录存在
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		c.JSON(500, gin.H{"error": "无法创建上传目录"})
		return
	}

	// 生成唯一文件名：时间戳 + 随机数，防止重名覆盖
	filename := fmt.Sprintf("%s_%08x%s", time.Now().Format("20060102150405"), rand.Uint32(), ext)
	savePath := filepath.Join("uploads", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(500, gin.H{"error": "图片保存失败"})
		return
	}

	// 返回可访问的图片 URL
	imageURL := "/uploads/" + filename
	c.JSON(200, gin.H{"data": imageURL})
}
