"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
type Region = (typeof REGIONS)[number];

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>("taipei");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage("請選擇一個檔案");
      return;
    }
    if (!selectedRegion) {
      setMessage("請選擇一個地區");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("region", selectedRegion);

    setIsLoading(true);
    setMessage("正在上傳並處理檔案，請稍候...");

    try {
      const response = await axios.post("/api/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(
        `檔案處理成功，共處理 ${response.data.totalProcessed} 筆數據，新增 ${response.data.insertedCount} 筆，更新 ${response.data.updatedCount} 筆`
      );
    } catch (error) {
      setMessage("檔案上傳或處理失敗");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm("確定要刪除所有現有數據嗎？此操作不可逆。")) {
      setIsDeletingData(true);
      try {
        const response = await axios.post("/api/admin/clearData");
        setMessage(`數據清除成功，共刪除 ${response.data.deletedCount} 筆數據`);
      } catch (error) {
        setMessage("數據清除失敗");
        console.error(error);
      } finally {
        setIsDeletingData(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>管理員頁面</CardTitle>
          <CardDescription>上傳 CSV 檔案或清除現有數據</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                disabled={isLoading}
                className="cursor-pointer"
              />
            </div>
            <Select
              onValueChange={(value) => setSelectedRegion(value as Region)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇地區" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="taipei">台北</SelectItem>
                <SelectItem value="newTaipei">新北</SelectItem>
                <SelectItem value="taoyuan">桃園</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  處理中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  上傳檔案
                </>
              )}
            </Button>
          </form>
          <Button
            onClick={handleClearData}
            disabled={isDeletingData}
            variant="destructive"
            className="w-full mt-4"
          >
            {isDeletingData ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                刪除中...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                清除所有數據
              </>
            )}
          </Button>
          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
