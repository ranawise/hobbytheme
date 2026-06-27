@extends('layouts.admin')

@section('title')
    Icons &rarr; {{ $icon->name }}
@endsection

@section('content-header')
    <h1>{{ $icon->name }}<small>Edit icon details.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.icons') }}">Icons</a></li>
        <li class="active">{{ $icon->name }}</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12 col-sm-8">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Icon Details</h3>
            </div>
            <form action="{{ route('admin.icons.view', $icon->id) }}" method="POST">
                <div class="box-body">
                    {!! csrf_field() !!}
                    {!! method_field('PATCH') !!}
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" class="form-control" value="{{ $icon->name }}" required>
                    </div>
                    <div class="form-group">
                        <label>Rarity</label>
                        <select name="rarity" class="form-control" required>
                            @foreach (['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','LIMITED'] as $r)
                            <option value="{{ $r }}" {{ $icon->rarity === $r ? 'selected' : '' }}>{{ ucfirst(strtolower($r)) }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Image URL</label>
                        <input type="url" name="image_url" class="form-control" value="{{ $icon->image_url }}" required>
                    </div>
                    <div class="form-group">
                        <label>Credit Cost</label>
                        <input type="number" name="credit_cost" class="form-control" min="0" value="{{ $icon->credit_cost }}" required>
                    </div>
                    <div class="form-group">
                        <label>Available Until (optional)</label>
                        <input type="date" name="available_until" class="form-control" value="{{ $icon->available_until ? $icon->available_until->format('Y-m-d') : '' }}">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="hidden" name="available" value="0">
                            <input type="checkbox" name="available" value="1" {{ $icon->available ? 'checked' : '' }}>
                            Available for purchase
                        </label>
                    </div>
                </div>
                <div class="box-footer">
                    <button name="action" value="edit" class="btn btn-sm btn-primary pull-right">Save Changes</button>
                    <button name="action" value="delete" class="btn btn-sm btn-danger pull-left muted muted-hover"
                        onclick="return confirm('Delete this icon? Users who already own it will keep it.')">
                        <i class="fa fa-trash-o"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>
    <div class="col-xs-12 col-sm-4">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Preview</h3>
            </div>
            <div class="box-body text-center" style="padding:24px">
                <img src="{{ $icon->image_url }}" alt="{{ $icon->name }}"
                    style="width:96px;height:96px;object-fit:contain;border-radius:12px;background:#111;padding:8px;border:1px solid rgba(255,255,255,0.08)">
                <p style="margin-top:12px;font-weight:600">{{ $icon->name }}</p>
                @php
                    $rarityColors = [
                        'COMMON'    => '#9e9e9e',
                        'UNCOMMON'  => '#4caf50',
                        'RARE'      => '#2196f3',
                        'EPIC'      => '#9c27b0',
                        'LEGENDARY' => '#ff9800',
                        'LIMITED'   => '#f44336',
                    ];
                @endphp
                <p style="color:{{ $rarityColors[$icon->rarity] ?? '#9e9e9e' }};font-weight:600;font-size:12px">{{ $icon->rarity }}</p>
                <p class="text-muted">{{ number_format($icon->credit_cost) }} credits</p>
            </div>
        </div>
    </div>
</div>
@endsection
