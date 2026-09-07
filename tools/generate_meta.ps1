<#
PowerShell script para gerar meta.json padrão em pastas content/*
Usage: abra PowerShell na raiz do repositório e execute:
  .\tools\generate_meta.ps1
Opcional: passar um path alternativo: .\tools\generate_meta.ps1 -ContentRoot "C:\caminho\para\content"
#>
param(
	[string]$ContentRoot = "content",
	[switch]$Force
)

if(-not (Test-Path $ContentRoot)){
	Write-Error "Pasta '$ContentRoot' não encontrada. Execute na raiz do repositório ou passe -ContentRoot.";
	exit 1
}

$dirs = Get-ChildItem -Path $ContentRoot -Directory | Sort-Object Name
foreach($d in $dirs){
	$metaPath = Join-Path $d.FullName 'meta.json'
	if((Test-Path $metaPath) -and (-not $Force)){
		Write-Host "Pulando $($d.Name) -> meta.json já existe" -ForegroundColor DarkGray
		continue
	}

	# tenta extrair <title> de index.html se existir
	$title = "Game $($d.Name)"
	$indexPath = Join-Path $d.FullName 'index.html'
	if(Test-Path $indexPath){
		try{
			$html = Get-Content -Path $indexPath -Raw -ErrorAction Stop
			$m = [regex]::Match($html, '<title[^>]*>(.*?)<\/title>', 'IgnoreCase')
			if($m.Success -and $m.Groups[1].Value.Trim() -ne ''){
				$title = $m.Groups[1].Value.Trim()
			}
		} catch{
			# ignore
		}
	}

	$metaObj = [ordered]@{
		title = $title
		description = "Descrição não informada para $($d.Name). Adicione content/$($d.Name)/meta.json manualmente."
		links = @()
		extra = ""
	}

	$json = $metaObj | ConvertTo-Json -Depth 5
	try{
		$json | Out-File -FilePath $metaPath -Encoding UTF8
		Write-Host "Criado: $metaPath" -ForegroundColor Green
	} catch{
		Write-Warning ("Falha ao escrever {0}: {1}" -f $metaPath, $_)
	}
}

Write-Host "Pronto. Revise os meta.json gerados e adapte títulos/links conforme necessário." -ForegroundColor Cyan
