<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PadDatasetController extends Controller
{
    /**
     * Menyajikan Data JSON Jumlah Pendapatan Asli Daerah (PAD) 2023-2024 Kab. Lampung Utara
     * Dapat diakses publik melalui browser secara langsung.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'service' => 'Gerbang API Kabupaten Lampung Utara',
            'dataset' => 'Jumlah Pendapatan Asli Daerah (PAD) tahun 2023 2024 Kab. Lampung Utara',
            'organization' => [
                'name' => 'Badan Pengelola Keuangan dan Aset Daerah (BPKAD)',
                'code' => 'bpkad',
                'kabupaten' => 'Lampung Utara',
                'provinsi' => 'Lampung',
            ],
            'tahun_anggaran' => ['2023', '2024'],
            'meta' => [
                'package_id' => '7080a6bf-733c-408e-805c-e2e3ba5ffe2d',
                'resource_id' => '047bf171-881f-45a9-a8f7-814f31a0e43a',
                'license' => 'Other (Open)',
                'format' => 'JSON',
                'source' => 'https://data.lampungutarakab.go.id/dataset/7080a6bf-733c-408e-805c-e2e3ba5ffe2d',
                'download_csv' => 'https://data.lampungutarakab.go.id/dataset/7080a6bf-733c-408e-805c-e2e3ba5ffe2d/resource/047bf171-881f-45a9-a8f7-814f31a0e43a/download/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab.-lampung-utara.csv'
            ],
            'total_records' => 5,
            'data' => [
                [
                    'id' => 1,
                    'jenis_pendapatan' => 'Pajak Daerah',
                    'pad_2023' => 'Rp 45.230.150.000',
                    'pad_2024' => 'Rp 48.750.320.000',
                    'pertumbuhan_persen' => 7.78,
                    'satuan' => 'Rupiah'
                ],
                [
                    'id' => 2,
                    'jenis_pendapatan' => 'Retribusi Daerah',
                    'pad_2023' => 'Rp 12.450.800.000',
                    'pad_2024' => 'Rp 14.120.500.000',
                    'pertumbuhan_persen' => 13.41,
                    'satuan' => 'Rupiah'
                ],
                [
                    'id' => 3,
                    'jenis_pendapatan' => 'Hasil Pengelolaan Kekayaan Daerah yang Dipisahkan',
                    'pad_2023' => 'Rp 6.820.400.000',
                    'pad_2024' => 'Rp 7.250.000.000',
                    'pertumbuhan_persen' => 6.30,
                    'satuan' => 'Rupiah'
                ],
                [
                    'id' => 4,
                    'jenis_pendapatan' => 'Lain-Lain PAD yang Sah',
                    'pad_2023' => 'Rp 32.110.600.000',
                    'pad_2024' => 'Rp 35.840.900.000',
                    'pertumbuhan_persen' => 11.62,
                    'satuan' => 'Rupiah'
                ],
                [
                    'id' => 5,
                    'jenis_pendapatan' => 'Total Realisasi Pendapatan Asli Daerah (PAD)',
                    'pad_2023' => 'Rp 96.611.950.000',
                    'pad_2024' => 'Rp 105.961.720.000',
                    'pertumbuhan_persen' => 9.68,
                    'satuan' => 'Rupiah'
                ]
            ]
        ], 200, [
            'Content-Type' => 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
