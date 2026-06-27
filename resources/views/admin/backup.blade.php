@extends('layouts.admin')

@section('title')
    Backup & Restore
@endsection

@section('content-header')
    <h1>Backup & Restore<small>Download a full backup or restore from a previous one.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Backup & Restore</li>
    </ol>
@endsection

@section('content')
<div class="row">
    {{-- Download --}}
    <div class="col-md-6">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Download Backup</h3>
            </div>
            <div class="box-body">
                <p>Generates a fresh backup containing the database, <code>.env</code>, and all panel files. Click the button and the download will start after ~15 seconds.</p>
                <a href="{{ route('admin.backup.download') }}" class="btn btn-primary">
                    <i class="fa fa-download"></i> Download Backup
                </a>
            </div>
        </div>
    </div>

    {{-- Restore --}}
    <div class="col-md-6">
        <div class="box box-danger">
            <div class="box-header with-border">
                <h3 class="box-title">Restore from Backup</h3>
            </div>
            <div class="box-body">
                <div class="alert alert-warning">
                    <strong>Warning:</strong> This will overwrite the current database and panel files. There is no undo.
                </div>
                <form id="restore-form" enctype="multipart/form-data">
                    @csrf
                    <div class="form-group">
                        <label>Backup File (.tar.gz)</label>
                        <input type="file" name="backup" id="backup-file" accept=".gz,.tar.gz" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-danger" id="restore-btn">
                        <i class="fa fa-upload"></i> Upload & Restore
                    </button>
                </form>
                <div id="restore-status" style="margin-top:12px;display:none;"></div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    document.getElementById('restore-form').addEventListener('submit', function(e) {
        e.preventDefault();

        var file = document.getElementById('backup-file').files[0];
        if (!file) return;

        var btn = document.getElementById('restore-btn');
        var status = document.getElementById('restore-status');

        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Restoring… this may take a minute';
        status.style.display = 'none';

        var form = new FormData(this);

        fetch('/admin/backup/restore', {
            method: 'POST',
            body: form,
            headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}' },
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.status === 'restored') {
                status.innerHTML = '<div class="alert alert-success"><i class="fa fa-check"></i> Restore complete! Refresh the page.</div>';
            } else {
                status.innerHTML = '<div class="alert alert-danger">Unexpected response.</div>';
            }
            status.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa fa-upload"></i> Upload & Restore';
        })
        .catch(function(err) {
            status.innerHTML = '<div class="alert alert-danger">Error: ' + err + '</div>';
            status.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa fa-upload"></i> Upload & Restore';
        });
    });
    </script>
@endsection
